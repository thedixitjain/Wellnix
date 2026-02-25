def calculate_bmi(height_cm, weight_kg):
    """Calculate Body Mass Index (BMI)"""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m * height_m)
    return round(bmi, 2)

def interpret_bmi(bmi):
    """Interpret BMI category"""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal weight"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obesity"

def calculate_bmr(profile):
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
    age = profile.get('age', 30)
    gender = profile.get('gender', 'male')
    weight_kg = profile.get('weight_kg', 70)
    height_cm = profile.get('height_cm', 170)
    
    if gender.lower() == 'male':
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    
    return round(bmr, 0)

def calculate_tdee(bmr, activity_level):
    """Calculate Total Daily Energy Expenditure"""
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    
    multiplier = activity_multipliers.get(activity_level, 1.2)
    return round(bmr * multiplier, 0)

def assess_disease_risk(profile):
    """Assess disease risk based on profile information"""
    risks = {}
    
    # BMI-based risk assessment
    bmi = calculate_bmi(profile.get('height_cm', 170), profile.get('weight_kg', 70))
    if bmi >= 30:
        risks['obesity'] = 'High'
        risks['diabetes'] = 'Elevated'
        risks['heart_disease'] = 'Elevated'
    elif bmi >= 25:
        risks['obesity'] = 'Moderate'
        risks['diabetes'] = 'Moderate'
        risks['heart_disease'] = 'Moderate'
    
    # Smoking risk
    if profile.get('smoker', False):
        risks['lung_disease'] = 'High'
        risks['heart_disease'] = 'High'
    
    # Alcohol consumption risk
    alcohol = profile.get('alcohol_consumption', 'none')
    if alcohol == 'frequent':
        risks['liver_disease'] = 'High'
    elif alcohol == 'occasional':
        risks['liver_disease'] = 'Low'
    
    # Family history risks
    family_history = profile.get('medical_history', {}).get('family_history', [])
    for condition in family_history:
        if condition.lower() == 'diabetes':
            risks['diabetes'] = risks.get('diabetes', 'Low') if risks.get('diabetes', 'Low') == 'Low' else risks.get('diabetes')
        elif condition.lower() == 'heart disease':
            risks['heart_disease'] = risks.get('heart_disease', 'Low') if risks.get('heart_disease', 'Low') == 'Low' else risks.get('heart_disease')
    
    # Sleep-related risks
    sleep_hours = profile.get('sleep_hours', 7)
    if sleep_hours < 6:
        risks['metabolic_disorders'] = 'Moderate'
    
    # Stress-related risks
    stress_level = profile.get('stress_level', 'low')
    if stress_level == 'high':
        risks['hypertension'] = 'Moderate'
    
    return risks

def calculate_health_metrics(profile):
    """Calculate various health metrics based on user profile"""
    height_cm = profile.get('height_cm', 170)
    weight_kg = profile.get('weight_kg', 70)
    
    # Calculate BMI
    bmi = calculate_bmi(height_cm, weight_kg)
    bmi_category = interpret_bmi(bmi)
    
    # Calculate BMR
    bmr = calculate_bmr(profile)
    
    # Calculate TDEE
    tdee = calculate_tdee(bmr, profile.get('activity_level', 'moderate'))
    
    # Calculate macronutrient recommendations
    goal = profile.get('goal', 'maintain weight')
    
    if goal == 'lose weight':
        calorie_target = tdee - 500  # 500 calorie deficit
    elif goal == 'gain weight':
        calorie_target = tdee + 500  # 500 calorie surplus
    else:
        calorie_target = tdee
    
    # Macronutrient distribution (40/30/30 for carbs/protein/fat)
    carbs_g = round((calorie_target * 0.4) / 4, 0)  # 4 calories per gram
    protein_g = round((calorie_target * 0.3) / 4, 0)  # 4 calories per gram
    fat_g = round((calorie_target * 0.3) / 9, 0)  # 9 calories per gram
    
    # Assess disease risks
    disease_risks = assess_disease_risk(profile)
    
    # Calculate ideal weight range using Devine formula
    if profile.get('gender', 'male').lower() == 'male':
        ideal_weight = 50 + 2.3 * ((height_cm / 2.54) - 60)
    else:
        ideal_weight = 45.5 + 2.3 * ((height_cm / 2.54) - 60)
    
    ideal_weight_range = (round(ideal_weight - 5, 1), round(ideal_weight + 5, 1))
    
    return {
        'bmi': bmi,
        'bmi_category': bmi_category,
        'bmr': bmr,
        'tdee': tdee,
        'calorie_target': calorie_target,
        'macros': {
            'carbs_g': carbs_g,
            'protein_g': protein_g,
            'fat_g': fat_g
        },
        'disease_risks': disease_risks,
        'ideal_weight_range_kg': ideal_weight_range
    }