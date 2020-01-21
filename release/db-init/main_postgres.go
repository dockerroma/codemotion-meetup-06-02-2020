package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"regexp"
	"io/ioutil"
        "bufio"
	_ "github.com/go-sql-driver/mysql"
)

const (
	driver = "mysql"
)

type answers struct {
	id       int
	sentence string
}

type dbConnection struct {
	user     string
	password string
	protocol string
	address  string
	port     string
	database string
}

var (
	createTableStatement,_ =ioutil.ReadFile("create.sql");
	insertDataStatementsFilePath ="insert.sql";
)

func getConnection()(*sql.DB, error) {
        myConn := &dbConnection{
		os.Getenv("APPDB_USER"),
		os.Getenv("APPDB_PASS"),
		os.Getenv("APPDB_PORT_3306_TCP_PROTO"),
		os.Getenv("APPDB_SERVICE_HOST"),
		os.Getenv("APPDB_SERVICE_PORT"),
		os.Getenv("APPDB_NAME"),
	}

	ds := fmt.Sprintf("%s:%s@%s(%s:%s)/%s", myConn.user, myConn.password, myConn.protocol, myConn.address, myConn.port, myConn.database)

	db, err := sql.Open(driver, ds)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
                return nil, err
	} else {
		log.Print("Connection successful.")
                return db, err

	}

}

func createTables(db *sql.DB ,  err error,createTableStatement string )(){
        _, err = db.Exec(createTableStatement)
	if err != nil {
		errMessage := err.Error()
		tableExistsCode := "1050"
		re := regexp.MustCompile(tableExistsCode)
		if re.FindString(errMessage) == tableExistsCode {
			log.Print("Table already exists, exiting.")
			os.Exit(0) 
		} else {
			log.Fatal(err)
		}
	}
}
func insertRows(db *sql.DB,err error,filepath string){
    file, err := os.Open(filepath)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
        res, erri := db.Exec(scanner.Text())
		if erri != nil {
			log.Fatal(erri)
		} else {
			rows, _ := res.RowsAffected()
			log.Printf("Last insert: %v, Rows affected: %v", res, rows)
		}


    }

    if erro := scanner.Err(); erro != nil {
        log.Fatal(erro)
    }
}

func main() {
	db, err := getConnection();
	createTables(db, err, string(createTableStatement));
	insertRows(db,err, insertDataStatementsFilePath);	
	log.Print("Database initialization completed.")
}
