# CBB to NBA Player Comps

This project generates NBA player comparisons for college basketball (CBB) prospects using shared advanced statistics. The goal is to compare playstyles and roles by calculating cosine similarity values from advanced statistics that are adverse to usage/scaling. 

Live site: https://cbb-nbacomps.netlify.app
---

## Datasets

This project uses two publicly available datasets from Kaggle:

- **College Basketball Players (2009–2021)**  
  https://www.kaggle.com/datasets/adityak2003/college-basketball-players-20092021

- **NBA Advanced Stats (2002–2022)**  
  https://www.kaggle.com/datasets/owenrocchi/nba-advanced-stats-20022022/data

Only statistics that exist in both datasets are used for comparisons.

---


## Advanced Stats Utilized

The following advanced metrics are aligned between the CBB and NBA datasets:

| Metric | Description | 
|------|------------|
| **3PAr** | Three-point attempt rate (shot profile) |
| **FTr** | Free throw rate (rim pressure) |
| **ORB%** | Offensive rebounding rate |
| **DRB%** | Defensive rebounding rate |
| **AST%** | Assist rate (playmaking role) |
| **STL%** | Steal rate (defensive activity) |
| **BLK%** | Block rate (rim protection) |
| **TOV%** | Turnover rate (ball security) |
| **USG%** | Usage rate (offensive involvement) |
| **TS%** | True shooting percentage (efficiency) |
| **BPM** | Box Plus/Minus (overall impact) |
| **OBPM** | Offensive Box Plus/Minus |
| **DBPM** | Defensive Box Plus/Minus |

These stats were chosen because:
1. They were shared between both CBB and NBA datasets.
2. They can appropriately represent the profile/playstyle of a player without relying on pure production statistics.

---

## How Players are compared

Each player is represented as a vector of advanced statistics. To compare players, the project computes **cosine similarity** between every CBB player and every NBA player:

_similarity(x, y) = (x · y) / (‖x‖ ‖y‖)_

This project uses cosine similarity to player performance because it measures how similar two vectors are based on direction, not magnitude. This allows us to compare players across varying scaled up/down roles. Between two players, a score close to 1.0 indicates very similar statistical profiles, while lower scores indicate less similar play styles.

For each CBB player:
1. Compute similarity against all NBA players.
2. Rank NBA players by similarity score.
3. Select the top 3 most similar NBA players as the player’s comps.

---

## Limitations & Future Improvements
- This project is limited to only utilizing advanced metrics that are present in both CBB and NBA datasets. However, there were only a few advanced stats that both datasets shared. These datasets could be expanded with more advanced stats in common.
- College and NBA playing styles can differ significantly.
- Era differences should be accounted for (ex. weigh 3PA less in modern era)

---
## Usage

### Generating NBA Comps

To generate the CBB → NBA player comparisons, run the analysis pipeline:

    cd analysis
    python comp.py

This script computes similarity scores between college and NBA players and outputs the comps files (comps.csv and comps.json) used by the frontend.

---

### Running the Site Locally

To run the frontend locally:

    cd pro-comps
    npm install
    npm run start

After starting the development server, open the local URL shown in the terminal in your browser.

> **Note:** Ensure that `comps.json` is placed in the `public/` directory of the frontend before running the site.

