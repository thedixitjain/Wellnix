# import os
# import re  # Importing the re module for regular expressions
# import easyocr  # Import EasyOCR

# def extract_nutrition_info(image_path):
#     # Check if the file exists
#     if not os.path.exists(image_path):
#         raise FileNotFoundError(f"File not found at: {image_path}")
    
#     reader = easyocr.Reader(['en'])  # You can set the language here
#     result = reader.readtext(image_path)

#     # Combine the results into a single string
#     extracted_text = "\n".join([text[1] for text in result])
#     return extracted_text

# def parse_nutrition_table(text):
#     # Initialize dictionary for nutrition info
#     nutrition_info = {
#         "calories": 0,
#         "fat": 0,
#         "saturated_fat": 0,
#         "trans_fat": 0,
#         "carbs": 0,
#         "sugars": 0,
#         "protein": 0,
#         "sodium": 0
#     }

#     calorie_match = re.search(r'energy\s*kcal\s*(\d+)', text, re.IGNORECASE)
#     protein_match = re.search(r'protein\s*g\s*(\d+\.?\d*)', text, re.IGNORECASE)
#     carbs_match = re.search(r'total\s*carbohydrate\s*g\s*(\d+\.?\d*)', text, re.IGNORECASE)
#     sugars_match = re.search(r'sugars\s*g\s*(\d+\.?\d*)', text, re.IGNORECASE)
#     fat_match = re.search(r'total\s*fat\s*g\s*(\d+\.?\d*)', text, re.IGNORECASE)
#     saturated_fat_match = re.search(r'saturated\s*fat\s*g\s*(\d+\.?\d*)', text, re.IGNORECASE)
#     trans_fat_match = re.search(r'trans\s*fat\s*g\s*(\d+\.?\d*)', text, re.IGNORECASE)
#     sodium_match = re.search(r'sodium\s*mg\s*(\d+)', text, re.IGNORECASE)    

#     # Fill the nutrition info dictionary with the extracted values
#     if calorie_match:
#         nutrition_info["calories"] = int(calorie_match.group(1))
#     if protein_match:
#         nutrition_info["protein"] = float(protein_match.group(1))
#     if carbs_match:
#         nutrition_info["carbs"] = float(carbs_match.group(1))
#     if sugars_match:
#         nutrition_info["sugars"] = float(sugars_match.group(1))
#     if fat_match:
#         nutrition_info["fat"] = float(fat_match.group(1))
#     if saturated_fat_match:
#         nutrition_info["saturated_fat"] = float(saturated_fat_match.group(1))
#     if trans_fat_match:
#         nutrition_info["trans_fat"] = float(trans_fat_match.group(1))
#     if sodium_match:
#         nutrition_info["sodium"] = int(sodium_match.group(1))

#     return nutrition_info
import easyocr
import re
from PIL import Image
import numpy as np
import os

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'], gpu=False)

def extract_nutrition_info(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at: {image_path}")

    image = Image.open(image_path)
    image_np = np.array(image)
    result = reader.readtext(image_np, detail=0)
    extracted_text = "\n".join(result)
    print("Extracted OCR Text:\n", extracted_text)
    return extracted_text

def parse_nutrition_table(text):
    def extract_number(patterns, combined_text):
        for pattern in patterns:
            match = re.search(pattern, combined_text, re.IGNORECASE)
            if match:
                numbers = re.findall(r'[\d.]+', match.group(0))
                numbers = [float(n) for n in numbers if n.replace('.', '', 1).isdigit()]
                if numbers:
                    return max(numbers)  # Choose the most likely correct value
        return 0.0

    # Step 1: Preprocess lines and stitch broken values
    lines = [line.strip().lower() for line in text.splitlines() if line.strip()]
    stitched_lines = []
    buffer = ""

    for line in lines:
        if re.match(r'^\d+(\.\d+)?$', line):  # If it's just a number, attach to previous line
            buffer += " " + line
        else:
            if buffer:
                stitched_lines.append(buffer)
            buffer = line
    if buffer:
        stitched_lines.append(buffer)

    combined_text = "\n".join(stitched_lines)
    print("\nProcessed Text for Regex:\n", combined_text)

    # Step 2: Apply flexible regex patterns
    nutrition_data = {
        "calories": extract_number([r'(?:kcal|energy)[^\d]{0,5}([\d.\s]+)'], combined_text),
        "protein": extract_number([r'protein[^\d]{0,5}([\d.\s]+)'], combined_text),
        "carbs": extract_number([r'(?:total\s*)?carbohydrate[^\d]{0,5}([\d.\s]+)'], combined_text),
        "sugars": extract_number([r'sugars?[^\d]{0,5}([\d.\s]+)'], combined_text),
        "fat": extract_number([r'(?:total\s*)?fat[^\d]{0,5}([\d.\s]+)'], combined_text),
        "saturated_fat": extract_number([r'saturated\s*fat[^\d]{0,5}([\d.\s]+)'], combined_text),
        "trans_fat": extract_number([r'trans\s*fat[^\d]{0,5}([\d.\s]+)'], combined_text),
        "sodium": extract_number([r'sodium\s*mg[^\d]{0,5}([\d.\s]+)', r'sodium[^\d]{0,5}([\d.\s]+)'], combined_text),
    }

    return nutrition_data

# --- Main Execution ---
# if __name__ == "__main__":
#     image_path = "C:/Users/Divya/Downloads/health_o_meter/1531721107-NutritionalLabel_copy.jpg"  # Update this path if needed
#     try:
#         text = extract_text_from_image(image_path)
#         nutrition_info = parse_nutrition_table(text)

#         print("\n✅ Extracted Nutritional Information:")
#         for key, value in nutrition_info.items():
#             print(f"{key}: {value}")
#     except Exception as e:
#         print(f"❌ Error: {e}")
