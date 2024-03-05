import { useEffect, useState, useRef } from "react";
import StarRating from "./Components/StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorgageState";
import Loader from "./Components/Loader";
import ErrorMessage from "./Components/ErrorMessage";
import NavBar from "./Components/NavBar";
import Logo from "./Components/Logo";
import NumResults from "./Components/NumResults";
import Main from "./Components/Main";
import Box from "./Components/Box";
import MovieList from "./Components/MovieList";
import WatchedMoviesList from "./Components/WatchedMoviesList";
import WatchedSummary from "./Components/WatchedSummary";
import Search from "./Components/Search";

const KEY = "dbbf43ec";

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const { movies, isLoading, error } = useMovies(query);

	const [watched, setWatched] = useLocalStorageState([], "watched");

	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (id === selectedId ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	return (
		<>
			<NavBar>
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList
							movies={movies}
							onSelectMovie={handleSelectMovie}
						/>
					)}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	const countRef = useRef(0);

	//Demonstrating the use of useRef to create a count of rating selections as a user tries to determine the rating
	useEffect(
		function () {
			if (userRating) countRef.current += 1;
		},
		[userRating]
	);

	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
			countRatingDecicions: countRef.current,
		};

		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	useEffect(
		function () {
			function callback(e) {
				if (e.code === "Escape") {
					onCloseMovie();
					console.log("CLOSING");
				}
			}
			document.addEventListener("keydown", callback);

			return function () {
				document.removeEventListener("keydown", callback);
			};
		},
		[onCloseMovie]
	);

	useEffect(() => {
		const getMovieDetails = async () => {
			setIsLoading(true);

			const res = await fetch(
				`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
			);

			if (!res.ok)
				throw new Error("Something went wrong with fetching movies");

			const data = await res.json();

			if (data.Response === "False") throw new Error("Movie not found");

			setMovie(data);
			setIsLoading(false);
		};
		getMovieDetails();
	}, [selectedId]);

	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			return function () {
				document.title = "usePopcorn";
			};
		},
		[title]
	);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span>
								{imdbRating} IMDB rating
							</p>
						</div>
					</header>
					<div className="rating">
						{!isWatched ? (
							<>
								<StarRating
									maxRating={10}
									size={24}
									onSetRating={setUserRating}
								/>

								{userRating > 0 && (
									<button
										className="btn-add"
										onClick={handleAdd}
									>
										+ Add to list
									</button>
								)}
							</>
						) : (
							<p>
								You already rated this movie {watchedUserRating}
								<span>⭐️</span>
							</p>
						)}
					</div>
					<section>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}
