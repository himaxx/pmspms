import pandas as pd
import json
import numpy as np

def parse_sizewise():
    file_path = 'Design Sizewise Lengths .xlsx'
    try:
        xls = pd.ExcelFile(file_path)
    except Exception as e:
        print(f"Error opening file: {e}")
        return

    # Categories to implement
    categories = ["Full Bottoms", "Tops", "Capri", "Shorts", "Skirts", "Long Tops", "Sets", "Boys"]
    
    final_data = {}

    for sheet_name in xls.sheet_names:
        category_key = "Tops" if sheet_name.upper() == "TOPS" else sheet_name
        
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        
        # Widths are at row 0 (0-indexed), starting from column 3
        panna_widths = []
        for i in range(3, 16): # Up to 62" or 70"
            val = df.iloc[0, i]
            if pd.notna(val):
                panna_widths.append(str(val).replace('"', ''))
        
        designs = []
        current_design = None
        current_pieces = None
        
        # Data starts from row 2
        for i in range(2, len(df)):
            design_name = df.iloc[i, 0]
            pieces = df.iloc[i, 1]
            size = df.iloc[i, 2]
            
            if pd.notna(design_name):
                current_design = str(design_name).strip()
            if pd.notna(pieces):
                current_pieces = str(pieces).strip()
                
            if pd.isna(size) or str(size).strip() == "" or str(size).strip() == "-":
                continue
                
            size = str(size).strip()
            
            # Extract lengths
            lengths = {}
            for j, width in enumerate(panna_widths):
                col_idx = j + 3
                if col_idx < df.shape[1]:
                    val = df.iloc[i, col_idx]
                    if pd.notna(val) and val != "-":
                        try:
                            lengths[width] = float(val)
                        except:
                            lengths[width] = None
                    else:
                        lengths[width] = None
            
            # Find or create design entry
            design_entry = next((d for d in designs if d['name'] == current_design), None)
            if not design_entry:
                design_entry = {
                    "name": current_design,
                    "pieces": current_pieces,
                    "sizes": []
                }
                designs.append(design_entry)
            
            design_entry['sizes'].append({
                "size": size,
                "lengths": lengths
            })
            
        final_data[category_key] = designs

    # Add sample data for other categories if they don't exist
    for cat in categories:
        if cat not in final_data:
            # Add one sample design for each category to show it works
            final_data[cat] = [
                {
                    "name": f"Sample {cat} Design",
                    "pieces": "24",
                    "sizes": [
                        {
                            "size": "22/32",
                            "lengths": {w: round(1.5 + (i * 0.1), 2) for i, w in enumerate(["51", "52", "53", "54", "55", "56", "58", "60", "62"])}
                        },
                        {
                            "size": "26/36",
                            "lengths": {w: round(1.8 + (i * 0.1), 2) for i, w in enumerate(["51", "52", "53", "54", "55", "56", "58", "60", "62"])}
                        }
                    ]
                }
            ]

    # Save to JSON
    with open('src/data/sizewise_details.json', 'w') as f:
        json.dump(final_data, f, indent=2)
    
    print("Parsing complete. Saved to src/data/sizewise_details.json")

if __name__ == "__main__":
    parse_sizewise()
