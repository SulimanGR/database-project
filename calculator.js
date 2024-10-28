function calculateDailyNeeds() {
    var age = parseInt(document.getElementById("age").value);
    var height = parseFloat(document.getElementById("height").value); // Height in cm
    var weight = parseFloat(document.getElementById("weight").value); // Weight in kg

    // Calculate BMI
    var bmi = calculateBMI(weight, height);

    // Formula to calculate daily protein intake (in grams)
    var protein = weight * 0.8;

    // Formula to calculate daily carbohydrate intake (in grams)
    var carbohydrates = weight * 5;

    // Formula to calculate daily calorie intake
    // Assuming sedentary lifestyle (BMR formula)
    var calories = 10 * weight + 6.25 * height - 5 * age + 5;

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
    // BMI = weight (kg) / (height (m) * height (m))
    var heightMeters = height / 100; // Convert height from cm to meters
    var bmi = weight / (heightMeters * heightMeters);
    return bmi;
}
