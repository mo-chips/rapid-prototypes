using QuizGenerator.Core;
using Microsoft.Data.Sqlite;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Diagnostics.Tracing;
using System.Text.Json;
using QuizGenerator.API;


// Intiate
ChatClient client = new ChatClient(
    model: "gpt-4o-mini",
    apiKey: Environment.GetEnvironmentVariable("OPEN_AI_KEY")
    );

string dbPath = "Data Source=quizdata.db";

ISQLiteHelper db = new SQLiteHelper(dbPath);

db.InitalizeDataBase();

string[] _languages = { "C++", "Python", "Javascript" };
string[] topics = { "Variables", "Functions", "Loops", "Classes", "Arrays" };

// Create services
var inputHelper = new UserInputHelper(_languages);
var quizService = new QuizService(client, db);

string selectedLanguage = inputHelper.SelectLanguage();
string selectedTopic = inputHelper.SelectTopic(topics);
int selectDifficulty = inputHelper.SelectDifficulty();

string _quiz = await quizService.GenerateQuiz(selectedLanguage, selectDifficulty, selectedTopic);

// Deserialize
Quiz _QuizObject = null;
if(!string.IsNullOrEmpty(_quiz))
{
    try
    {
        _QuizObject = JsonSerializer.Deserialize<Quiz>(_quiz);
        Console.WriteLine("\n--- Quiz Object Deserialized Successfully ---");
        Console.WriteLine($"Quiz Title: {_QuizObject.Title}");
        Console.WriteLine($"Number of Questions: {_QuizObject.Questions.Count}");
    }
    catch (JsonException jex)
    {
        Console.WriteLine($"\nError deserializing quiz JSON: {jex.Message}");
        Console.WriteLine("Please check if the AI's output matches the Quiz C# classes.");
        Console.WriteLine($"Raw JSON: {_QuizObject}");
    }
}
else
{
    Console.WriteLine("No quiz content generated to deserialize.");
}

// Complete quiz
if (_QuizObject != null)
{
    Console.WriteLine("\n--- Starting Quiz Completion ---");
    foreach (var question in _QuizObject.Questions)
    {
        Console.Clear(); // Clear for each new question
        Console.WriteLine($"\nQuiz: {_QuizObject.Title} | Topic: {_QuizObject.Topic}");
        Console.WriteLine($"Difficulty: {_QuizObject.Difficulty}");
        Console.WriteLine($"---------------------------------------------------");
        Console.WriteLine($"\nQuestion {question.QuestionNumber}: {question.QuestionText}");

        for (int i = 0; i < question.Options.Count; i++)
        {
            Console.WriteLine($" {(char)('A' + i)}. {question.Options[i]}");
        }

        string userChoice = inputHelper.GetValidAnswerChoice();
        string userChoiceText = "";
        int userChoiceIndex = userChoice[0] - 'a';
        if(userChoiceIndex >= 0 && userChoiceIndex < question.Options.Count)
        {
            userChoiceText = question.Options[userChoiceIndex];
        }
        question.UserAnswer = userChoiceText;
        question.IsCorrect = userChoiceText.Equals(question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);

        Console.Clear(); // Clear again to show results
        Console.WriteLine($"\nQuiz: {_QuizObject.Title} | Topic: {_QuizObject.Topic}");
        Console.WriteLine($"Difficulty: {_QuizObject.Difficulty}");
        Console.WriteLine($"---------------------------------------------------");
        Console.WriteLine($"\nQuestion {question.QuestionNumber}: {question.QuestionText}");
        Console.WriteLine($"\nYour selection: {userChoice.ToUpper()}");
        Console.WriteLine($"Correct Answer: {question.CorrectAnswer}");
        Console.WriteLine($"Result: {(question.IsCorrect ? "Correct!" : "Incorrect.")}");

        Console.WriteLine("\nPress Enter to continue to next question...");
        Console.ReadLine();

    }
    Console.WriteLine("\n--- Quiz Completed ---");

    // After completion, '_QuizObject' now holds the user's answers and correctness
    // Serialize it back to JSON to save to the database.
    string completedQuizJson = JsonSerializer.Serialize(_QuizObject);

    Console.WriteLine("\nSaving to database...");
    // Pass the completed JSON string
    db.SaveQuiz(completedQuizJson);

}

Console.WriteLine("\nPress Enter to exit.");
Console.ReadLine();


// Functions that restricts the user response

