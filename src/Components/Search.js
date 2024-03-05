import { useRef, useEffect } from "react";
import { useKey } from "../Utilities/useKey";

export default function Search({ query, setQuery }) {
	const inputEl = useRef(null);

	useEffect(function () {
		inputEl.current.focus();
	}, []);

	useKey("Enter", function () {
		if (document.activeElement === inputEl.current) return;
		inputEl.current.focus();
		setQuery("");
	});

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
}
