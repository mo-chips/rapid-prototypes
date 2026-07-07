using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// Domain models representing a quiz snapshot.
// Designed to mirror the JSON structure returned by the AI
// and persisted in storage, allowing quizzes to be replayed,
// reviewed, and evaluated independently of generation logic.

namespace QuizGenerator.Core
{
    public class QuizQuestion
    {
        public int Id { get; set; }
        public int QuestionNumber { get; set; }
        public string QuestionText { get; set; }
        public List<string> Options { get; set; }
        public string CorrectAnswer { get; set; }

        public string UserAnswer { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class Quiz
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Topic { get; set; }
        public string Difficulty { get; set; }
        public List<QuizQuestion> Questions { get; set; }

        public string UserId { get; set; } = string.Empty;
    }
}
