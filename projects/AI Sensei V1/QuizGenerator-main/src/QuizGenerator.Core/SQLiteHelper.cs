using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// SQLite persistence layer for quizzes.
// Responsible only for schema setup and basic CRUD operations.
// Stores quizzes as JSON snapshots to preserve historical accuracy
// even if quiz generation logic changes later.


namespace QuizGenerator.Core
{
    public class SQLiteHelper : ISQLiteHelper
    {
        private readonly string _ConnectionString;
        public SQLiteHelper(string connectionString)
        {
            _ConnectionString = connectionString;
        }   

        public void InitalizeDataBase()
        {
            using (var connection = new SqliteConnection(_ConnectionString)) 
            {
                connection.Open();
                Console.WriteLine("Database connected!");

                string createQuizTable = @"
                CREATE TABLE IF NOT EXISTS Quizzes (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    JsonContent TEXT NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                ";

                var command = connection.CreateCommand();
                command.CommandText = createQuizTable;
                command.ExecuteNonQuery();
            } ;
        }

        public int SaveQuiz(string quizJSON)
        {
            using(var connection = new SqliteConnection(_ConnectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "INSERT INTO Quizzes (JsonContent) VALUES ($json)";
                command.Parameters.AddWithValue("$json", quizJSON);
                command.ExecuteNonQuery();

                command.CommandText = "SELECT last_insert_rowid()";

                long newID = (long)command.ExecuteScalar();

                return (int)newID;
            }  
        }

        public string? LoadQuiz(int quizID)
        {
            using (var connection = new SqliteConnection(_ConnectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT JsonContent FROM Quizzes WHERE Id = @id";
                command.Parameters.AddWithValue("@id", quizID);

                var quiz = command.ExecuteScalar();
                return quiz?.ToString();
            }
        }

        public void DeleteQuiz(int quizID)
        {
            using(var connection = new SqliteConnection(_ConnectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "DELETE FROM Quizzes WHERE Id = @id";
                command.Parameters.AddWithValue("@id", quizID);
                command.ExecuteNonQuery();
            }
        }

        public List<QuizRecord> LoadAllQuizzes()
        {
            var quizzes = new List<QuizRecord>();
            using (var connection = new SqliteConnection(_ConnectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT Id, JsonContent FROM Quizzes";
                using (var reader = command.ExecuteReader())
                {
                    while(reader.Read())
                    {
                        var record = new QuizRecord
                        {
                            Id = reader.GetInt32(0),
                            Content = reader.GetString(1)
                        };
                        quizzes.Add(record);
                    }
                }
            }
            return quizzes;
        }

        public void UpdateQuiz(int id, string json)
        {
            using (var connection = new SqliteConnection(_ConnectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "UPDATE Quizzes SET JsonContent = $json WHERE Id = $id";
                command.Parameters.AddWithValue("$json", json);
                command.Parameters.AddWithValue("$id", id);
                command.ExecuteNonQuery();
            }
        }
    }
}
