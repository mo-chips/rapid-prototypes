using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// Abstraction over quiz persistence.
// Defines the minimal contract required by the core domain
// to store and retrieve quiz snapshots without coupling
// to a specific database or storage implementation.

namespace QuizGenerator.Core
{
    public interface ISQLiteHelper
    {
        void InitalizeDataBase();
        int SaveQuiz(string quizJSON);
        string LoadQuiz(int quizID);
        List<QuizRecord> LoadAllQuizzes();
        void UpdateQuiz(int id, string json);
        void DeleteQuiz(int id);
    }
}
