package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "time"
    "bufio"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

type Guest struct {
    Name string
    
}

var (
        connectionUrl = "mongodb://"+os.Getenv("DB_USERNAME")+":"+os.Getenv("DB_PASSWORD")+"@"+os.Getenv("DB_HOST")+":"+os.Getenv("DB_PORT")
	database = os.Getenv("DB_DATABASE")
	collection = os.Getenv("DB_COLLECTION")
	insertDataStatementsFilePath ="insert.sql";
)

func getConnection()(*mongo.Client, error) {
        // Set client options
	clientOptions := options.Client().ApplyURI(connectionUrl)
	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
       		log.Fatal(err)
	}
	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
    		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")
	return client,err;

}

func insertRows(collection *mongo.Collection,err error,filepath string){
    file, err := os.Open(filepath)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
	oneguest := Guest{Name: scanner.Text()}
        insertResult, err := collection.InsertOne(context.TODO(), oneguest)
	if err != nil {
    		log.Fatal(err)
	}
	fmt.Println("Inserted a single document: ", insertResult.InsertedID)
    }
    if erro := scanner.Err(); erro != nil {
        log.Fatal(erro)
    }
}

func main() {
	client, err := getConnection()
        ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
        err = client.Connect(ctx)

	collection := client.Database(database).Collection(collection)
 	count, err := collection.CountDocuments(context.Background(), bson.D{})
	if count == 0 {	
	  insertRows(collection,err, insertDataStatementsFilePath);
	} else {
		log.Print("Database does NOT need initialization.")	
	}	
	log.Print("Database initialization completed.")


	err = client.Disconnect(context.TODO())
	
	if err != nil {
	    log.Fatal(err)
	}
	fmt.Println("Connection to MongoDB closed.")
}
