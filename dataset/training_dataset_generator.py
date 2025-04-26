import pandas as pd
import json

# Load your original dataset
df = pd.read_csv("games.csv")

# Select relevant columns
df = df[["victory_status", "winner", "white_rating", "black_rating", "moves", "opening_name"]]

# Function to generate human-like prompts and responses
def format_humanized_prompt(row):
    prompt = (
        "What is the name of the opening?\n"
        "Who won?\n"
        "How did the winner win?\n"
        "Can you predict the ratings of the players?\n\n"
        f"Moves:\n{row['moves']}"
    )

    # Clean and humanize fields
    victory = row["victory_status"].replace("outoftime", "timeout")
    winner = row["winner"].capitalize()

    response = (
        f"The game started with the {row['opening_name']}, which is a well-known opening in chess.\n"
        f"In the end, {winner} came out on top.\n"
        f"The win happened by {victory}, showing how the game concluded.\n"
        f"If I had to guess based on the game, I'd say White was around {row['white_rating']} and Black around {row['black_rating']}."
    )

    return {"prompt": prompt, "response": response}

# Apply transformation
humanized_data = df.apply(format_humanized_prompt, axis=1).tolist()

# Save as JSONL
with open("chess_humanized_prompts.jsonl", "w", encoding="utf-8") as f:
    for item in humanized_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
