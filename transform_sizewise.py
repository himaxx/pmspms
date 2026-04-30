import json

def transform_data():
    with open('design_sizewise_lengths.json', 'r') as f:
        src = json.load(f)
    
    # Categories to implement
    categories = ["Full Bottoms", "Tops", "Capri", "Shorts", "Skirts", "Long Tops", "Sets", "Boys"]
    
    transformed_designs = []
    
    for d in src.get('designs', []):
        design_name = d.get('design_name')
        sizes = []
        
        # We'll take the pieces from the first size that has it, as a fallback for the design header
        design_pieces = "--"
        
        for s in d.get('sizes', []):
            size_val = s.get('size')
            pieces_val = s.get('pieces')
            if pieces_val != "--" and design_pieces == "--":
                design_pieces = pieces_val
                
            lengths = {}
            for k, v in s.get('lengths_by_inch', {}).items():
                width = k.replace('"', '')
                if v == "--":
                    lengths[width] = None
                else:
                    try:
                        lengths[width] = float(v)
                    except:
                        lengths[width] = None
            
            sizes.append({
                "size": size_val,
                "pieces": pieces_val,
                "lengths": lengths
            })
            
        transformed_designs.append({
            "name": design_name,
            "pieces": design_pieces,
            "sizes": sizes
        })
    
    final_data = {cat: [] for cat in categories}
    final_data["Tops"] = transformed_designs
    
    # Add dummy data for others to keep the UI looking full
    for cat in categories:
        if not final_data[cat]:
            final_data[cat] = [
                {
                    "name": f"Sample {cat} Design",
                    "pieces": "24",
                    "sizes": [
                        {
                            "size": "22/32",
                            "pieces": "24",
                            "lengths": {str(w): round(1.5 + (i * 0.05), 2) for i, w in enumerate(range(51, 63))}
                        }
                    ]
                }
            ]

    with open('src/data/sizewise_details.json', 'w') as f:
        json.dump(final_data, f, indent=2)

if __name__ == "__main__":
    transform_data()
