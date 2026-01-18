import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

# 1: LOAD DATA
nba_csv_path = 'data/NBA_Advanced_Stats_2002-2022.csv'
cbb_csv_path = 'data/archive-2/CollegeBasketballPlayers2009-2021.csv'
comp_csv_path = '../data/comps.csv'

nba_df = pd.read_csv(nba_csv_path)
cbb_df = pd.read_csv(cbb_csv_path)

# print(nba_df.head())
# print(cbb_df.head())

print(nba_df.columns) 
print(cbb_df.columns)

# 2. DATA CLEANUP

# NBA: split year-name into year and name
nba_df[['year', 'name']] = nba_df['year-name'].str.split('-', n=1, expand=True)

# NBA traded players: keep row with "TOT" in team name (appears at top), then drop other rows with same name
nba_df.drop_duplicates(subset=['year', 'name'], keep='first', inplace=True)
print(
    nba_df[nba_df['name'] == 'Ray Allen']
    [['year', 'name', 'Tm', 'G']]
)

# CBB repeated year players: keep most recent year for duplicate name/school records
cbb_df = cbb_df.sort_values("year", ascending=False).drop_duplicates(subset=["player_name", "team"], keep="first")

# keep relevant features
NBA_CBB_FEATURE_MAP = {
    # key = NBA features, value = CBB features
    '3PAr': 'TP_per',
    'FTr': 'ftr',
    'ORB%': 'ORB_per',
    'DRB%': 'DRB_per',
    'AST%': 'AST_per',
    'STL%': 'stl_per',
    'BLK%': 'blk_per',
    'TOV%': 'TO_per', 
    'USG%': 'usg',
    'TS%': 'TS_per',
    "BPM": "bpm",
    "OBPM": "obpm",
    "DBPM": "dbpm",
}
nba_features = list(NBA_CBB_FEATURE_MAP.keys())
cbb_features = list(NBA_CBB_FEATURE_MAP.values())

# convert cbb fractions to percentages
cbb_df[["TS_per", "ftr", "TP_per"]] = cbb_df[["TS_per", "ftr", "TP_per"]] / 100.0

nba_df = nba_df.dropna(subset=nba_features).reset_index(drop=True)
cbb_df = cbb_df.dropna(subset=cbb_features).reset_index(drop=True)

nba_feats_df = nba_df[nba_features]
cbb_feats_df = cbb_df[cbb_features]


# rename cbb features to match nba features
cbb_feats_df = cbb_feats_df.rename(
    columns={cbb: nba for nba, cbb in NBA_CBB_FEATURE_MAP.items()}
)
print("COLUMNS AFTER RENAME:")
print(nba_feats_df.columns)
print(cbb_feats_df.columns)

def comp_nba_cbb_player(name: str):
    cbb_player_stats = cbb_feats_df[cbb_df['player_name'] == name]
    nba_player_stats = nba_feats_df[nba_df['name'] == name]

    print(f"Comparing stats for player: {name}")
    for key in NBA_CBB_FEATURE_MAP.keys():
        cbb_value = cbb_player_stats[key].values
        nba_value = nba_player_stats[key].values
        print(f"{key}: CBB={cbb_value}, NBA={nba_value}")
comp_nba_cbb_player("Zion Williamson")
print(f"Zion test: {nba_feats_df[nba_df['name'] == 'Zion Williamson']}")

# standardize features
scaler = StandardScaler()
nba_scaled = scaler.fit_transform(nba_feats_df)
cbb_scaled = scaler.transform(cbb_feats_df)

# 3. CREATE COMP CSV
comp_df = pd.DataFrame()

# For each CBB player's name, get their stats from CBB CSV, and do cosine simialarity with every NBA player's stats from NBA CSV
similarity_mat = cosine_similarity(cbb_scaled, nba_scaled)
rows = []
k = 3
for cbb_idx in range(len(cbb_df)):
    cbb_player = cbb_df.iloc[cbb_idx]
    cbb_name = cbb_player['player_name']
    cbb_team = cbb_player['team']
    cbb_year = cbb_player['year']
    cbb_pos = cbb_player['archetype']

    cbb_player_similarities = similarity_mat[cbb_idx]
    top_k_comps = np.argsort(cbb_player_similarities)[-k:][::-1]

    for rank, nba_idx in enumerate(top_k_comps, start=1):
        nba_player = nba_df.iloc[nba_idx]
        nba_name = nba_player['name']
        nba_team = nba_player['Tm']
        nba_year = nba_player['year']
        nba_pos = nba_player['Pos']
        comp_entry = {
            'cbb_name': cbb_name,
            'cbb_team': cbb_team,
            'cbb_year': cbb_year,
            'cbb_pos': cbb_pos,
            'nba_name': nba_name,
            'nba_team': nba_team,
            'nba_year': nba_year,
            'nba_pos': nba_pos,
            'similarity_rank': rank,
            'similarity_score': cbb_player_similarities[nba_idx],
        }
        rows.append(comp_entry)

# Save comps as CSV & JSON 
comp_df = pd.DataFrame(rows)
with open(comp_csv_path, "w") as f:
    comp_df.to_csv(f, index=False)

df = pd.read_csv(comp_csv_path)
df.to_json("../pro-comps/public/comps.json", orient="records")



