import { useEffect, useMemo, useState } from "react";

type CompRow = {
  cbb_name: string;
  cbb_team: string;
  cbb_year: number;
  cbb_pos: string;
  nba_name: string;
  nba_team: string;
  nba_year: number;
  nba_pos: string;
  similarity_rank: number;
  similarity_score: number;
};

export default function App() {
  const [data, setData] = useState<CompRow[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompRow[] | null>(null);

  useEffect(() => {
    fetch("/public/comps.json")
      .then(res => res.json())
      .then((json: CompRow[]) => setData(json));
  }, []);

  // CBB names for dropdown
  const cbbNames = useMemo(
    () => Array.from(new Set(data.map(d => d.cbb_name))),
    [data]
  );

  // Filter suggestions while typing in searchbar
  const suggestions = query.length === 0
    ? []
    : cbbNames
        .filter(name =>
          name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6);

  const handleSearch = () => {
    const matches = data
      .filter(d => d.cbb_name.toLowerCase() === query.toLowerCase())
      .sort((a, b) => a.similarity_rank - b.similarity_rank)
      .slice(0, 3);

    setResults(matches);
  };

  const reset = () => {
    setQuery("");
    setResults(null);
  };

  return (
    <div className="overlay">
      <div className="modal">
        {!results ? (
          <>
            <h1>CBB to NBA Comps</h1>

            <input
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search CBB player (from 2009 to 2021)..."
            />

            {suggestions.length > 0 && (
              <ul className="dropdown">
                {suggestions.map(name => (
                  <li
                    key={name}
                    onClick={() => setQuery(name)}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}

            <button
              className="button-primary"
              onClick={handleSearch}
              disabled={!query}
            >
              Generate comps
            </button>
          </>
        ) : (
          <>
            <h2>{query} ({results[0].cbb_pos}) top NBA comps</h2>

            {results.map(r => (
              <div className="result" key={`${r.nba_name}-${r.nba_year}`}>
                <strong>{r.nba_name}</strong>{" "}
                <span>
                  ({r.nba_pos}, {r.nba_team}, {r.nba_year}, Score: {r.similarity_score.toFixed(2)})
                </span>
              </div>
            ))}

            <button
              className="button-primary"
              onClick={reset}
            >
              Search again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
