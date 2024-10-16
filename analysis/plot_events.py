import json
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import pandas as pd
import argparse

def main(index_path, output_path):
    # Read the index data
    with open(index_path, 'r') as f:
        index_data = json.load(f)

    # Create a list of dictionaries with timestamp and category
    events = [
        {
            'timestamp': datetime.fromtimestamp(item['timestamp']/1000),
            'category': 'Condition' if 'condition_' in item['file'] else 'Observation'
        }
        for item in index_data
    ]

    # Convert to DataFrame
    df = pd.DataFrame(events)

    # Create the violin plot
    plt.figure(figsize=(12, 6))
    sns.violinplot(x='timestamp', y='category', data=df, inner='box')

    plt.title('Distribution of Events Over Time')
    plt.xlabel('Time')
    plt.ylabel('Event Category')

    # Format the x-axis to show dates nicely
    plt.gcf().autofmt_xdate()

    # Save the plot
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Violin plot saved as {output_path}")

    # Calculate and print some statistics
    total_events = len(df)
    duration = (df['timestamp'].max() - df['timestamp'].min()).total_seconds()
    events_per_second = total_events / duration

    print(f"Total events: {total_events}")
    print(f"Duration: {duration:.2f} seconds")
    print(f"Average events per second: {events_per_second:.2f}")

    # Print statistics for each category
    for category in ['Condition', 'Observation']:
        category_events = df[df['category'] == category]
        print(f"\n{category} events:")
        print(f"  Total: {len(category_events)}")
        print(f"  Percentage: {len(category_events) / total_events * 100:.2f}%")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate violin plot from event data")
    parser.add_argument("index_path", help="Path to the index.json file")
    parser.add_argument("output_path", help="Path to save the output plot")
    args = parser.parse_args()

    main(args.index_path, args.output_path)
