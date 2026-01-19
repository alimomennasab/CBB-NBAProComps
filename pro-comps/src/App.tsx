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
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetch("/comps.json")
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
        // .slice(0, 6);

  const handleSearch = (overrideQuery?: string) => {
    const q = overrideQuery ?? query;

    const matches = data
      .filter(d => d.cbb_name.toLowerCase() === q.toLowerCase())
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
            <h1 style={{ alignSelf: "center" }}>CBB to NBA Comps</h1>

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
                    onClick={() => {
                      setQuery(name);
                      handleSearch(name);
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}

            <button
              className="button-primary"
              onClick={() => handleSearch()}
              disabled={!query}
            >
              GENERATE COMPS
            </button>
          </>
        ) : (
          <>
            <h2>
              {query}
              {results[0].cbb_pos && ` (${results[0].cbb_pos})`} top NBA comps
            </h2>

            {results.map(r => (
              <div className="result" key={`${r.nba_name}-${r.nba_year}`}>
                <strong>{r.nba_name}</strong>{" "}
                <span style={{ color: "var(--accent)" }}>
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
        <button
          className="button-secondary"
          onClick={() => setShowInfo(true)}
        >
          How does this work?
        </button>
      </div>
      {showInfo && (
      <div className="overlay">
        <div className="modal">
          <h2>
            How does this work?
          </h2>

          <p>
            This demo compares college basketball players (CBB) to NBA players using advanced statistics
            that exist in both datasets.
          </p>

          <p>
            These include shooting profile (
            <span className="accent">3PAr</span>,{" "}
            <span className="accent">TS%</span>,{" "}
            <span className="accent">FTr</span>), playmaking and usage (
            <span className="accent">AST%</span>,{" "}
            <span className="accent">USG%</span>,{" "}
            <span className="accent">TOV%</span>), rebounding (
            <span className="accent">ORB%</span>,{" "}
            <span className="accent">DRB%</span>), defense (
            <span className="accent">STL%</span>,{" "}
            <span className="accent">BLK%</span>), and overall impact (
            <span className="accent">BPM</span>,{" "}
            <span className="accent">OBPM</span>,{" "}
            <span className="accent">DBPM</span>).
          </p>

          <p>
            Each CBB and NBA player is represented as a vector of these advanced stats. We then compute
            <span className="accent"> cosine similarity</span> between every CBB
            player (x) and every NBA player (y):
          </p>

          <p className="equation">
            similarity(x, y) = (x · y) / (‖x‖ ‖y‖)
          </p>

          <p>
            For each CBB player, we rank all NBA players by similarity and select the top 3 as that player’s NBA comps.
          </p>
          <h4>Limitations & future improvements: </h4>
          <p>
            • Expand datasets with more advanced stats
            <br />
            • Account for era/league (ex. weigh 3PA less in modern era)
            <br />
            • I wanted to avoid positional filtering as the NBA strays away from traditional positions, but this leads to bad comps,
            like Stephen Curry comps to Lebron & Kobe. Possible solution: consider height/weight data
          </p>


          <p> Source code: {" "} 
            <a
              href="https://github.com/alimomennasab/CBB-NBAProComps"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              GitHub repository
            </a>
          </p>

          <button
            className="button-primary"
            onClick={() => setShowInfo(false)}
          >
            Close
          </button>

        </div>
      </div>
    )}


    </div>
  );
}
