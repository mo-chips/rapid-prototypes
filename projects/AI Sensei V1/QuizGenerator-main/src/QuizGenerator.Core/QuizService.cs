using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Text.Json;
using System.Threading.Tasks;

// Core application service.
// Orchestrates quiz generation via the OpenAI API and persistence
// of quiz snapshots through a storage abstraction.
// Intentionally keeps business rules here while delegating
// infrastructure concerns (AI, database) to injected dependencies.

namespace QuizGenerator.Core
{
    public class QuizService
    {
        private ChatClient _client;
        private ISQLiteHelper _db;

        public QuizService(ChatClient client, ISQLiteHelper db)
        {
            _client = client;
            _db = db;
        }

        public async Task<string> GenerateQuiz(string language, int difficulty, string topic)
        {
            // JSON structure 
            string jsonFormat = @"
            {
            ""Title"": ""Quiz Title Here"",
            ""Topic"": ""Quiz Topic"",
            ""Difficulty"": ""1-5"",
            ""Questions"": [
                    {
                        ""QuestionNumber"": 1,
                        ""QuestionText"": ""What is...?"",
                        ""Options"": [""Option A"", ""Option B"", ""Option C"", ""Option D""],
                        ""CorrectAnswer"": ""Option C"",
                        ""UserAnswer"": """",
                        ""IsCorrect"": false
                    }
                ]
            }";

            // Prompt
            string prompt = $@"
            Generate a {language} quiz about {topic} with a difficulty of {difficulty} out of 5.
            The quiz must contain exactly 10 theory questions.
            
            
            IMPORTANT RULES:
            - Respond ONLY with a valid JSON object.
            - Do NOT include any markdown formatting.
            - Do NOT include code fences such as ```json.
            - Do NOT include any explanation or text outside the JSON.
            - All JSON property names MUST use PascalCase to match C# classes.
            - Follow this exact JSON structure and field names:
            {jsonFormat}

            ";

            Console.WriteLine("\nGenerating JSON quiz... please wait.");

            try
            {
                var response = await _client.CompleteChatAsync(prompt);

                string outputText = response.Value.Content[0].Text; // This 'outputText' will BE the JSON string

                // Print it for the user to see now (it will look like JSON)
                Console.WriteLine("\n--- AI Response (Raw JSON) ---");
                Console.WriteLine(outputText);

                // Return the JSON string so we can save it
                return outputText;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"API Error: {ex.Message}");
                return null;
            }
        }
        

        public int SaveQuizToDataBase(string quizJSON)
        {
            _db.InitalizeDataBase();
            return _db.SaveQuiz(quizJSON);
        }

        public string GetQuizFromDataBase(int id)
        {
            return _db.LoadQuiz(id);
        }

        public void DeleteQuizFromDataBase(int id)
        {
           _db.DeleteQuiz(id);
        }

        public List<QuizRecord> GetAllQuizzesFromDataBase()
        {
            _db.InitalizeDataBase();
            return _db.LoadAllQuizzes();
        }

        public void UpdateQuizInDatabase(int id, string json)
        {
            _db.InitalizeDataBase();
            _db.UpdateQuiz(id, json);
        }
    }

    public class QuizRecord
    {
        public int Id { get; set; }
        public string Content { get; set; }
    }
}
