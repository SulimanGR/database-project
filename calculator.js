function calculateDailyNeeds() {
    var age = parseInt(document.getElementById("age").value);
    var height = parseFloat(document.getElementById("height").value); // Height in cm
    var weight = parseFloat(document.getElementById("weight").value); // Weight in kg
    var gender = document.querySelector('input[name="gender"]:checked').value; // Get selected gender
    var activityLevel = parseFloat(document.getElementById("activityLevel").value); // Activity multiplier
    var goal = document.querySelector('input[name="goal"]:checked').value; // Get selected goal

    // Calculate BMI
    var bmi = calculateBMI(weight, height);

    // Calculate BMR
    var bmr;
    if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5; // BMR for men
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161; // BMR for women
    }
    
    // Calculate daily calorie needs based on activity level
    var calories = bmr * activityLevel;

    // Adjust calories based on weight goal
    if (goal === "lose") {
        calories -= 500; // Create a deficit of about 500 calories for weight loss
    } else if (goal === "gain") {
        calories += 500; // Create a surplus of about 500 calories for weight gain
    }

    // Calculate daily protein intake (in grams)
    var protein;
    if (goal === "lose") {
        protein = weight * 2.2; // Increase protein for weight loss
    } else if (goal === "gain") {
        protein = weight * 1.8; // Adjust protein for weight gain
    } else {
        protein = weight * 1.6; // Standard for maintenance
    }

    // Calculate total calories from protein
    var proteinCalories = protein * 4; // Each gram of protein has 4 calories

    // Calculate daily carbohydrate intake (in grams)
    var carbohydrates = (calories - proteinCalories) / 4; // Fill the rest with carbs (4 calories per gram)

    // Ensure carbohydrates are not negative
    carbohydrates = Math.max(carbohydrates, 0);

    // Display the result
    var resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h2>Daily Nutrition Needs and BMI</h2>" +
        "<p>Daily Protein Needs: " + protein.toFixed(2) + " grams</p>" +
        "<p>Daily Carbohydrate Needs: " + carbohydrates.toFixed(2) + " grams</p>" +
        "<p>Daily Calorie Needs: " + calories.toFixed(2) + " calories</p>" +
        "<p>BMI: " + bmi.toFixed(2) + "</p>";
}

function calculateBMI(weight, height) {
    // Formula to calculate BMI (Body Mass Index)
    var heightMeters = height / 100; // Convert height from cm to meters
    var bmi = weight / (heightMeters * heightMeters);
    return bmi;
}
