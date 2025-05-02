package main

import (
	"fmt"
	"it-quiz/routes"
	"log"
	"net/http"
	"time"
)

func main() {
	routes.SetupIndexRoutes()

	server := &http.Server{
		Addr:         ":8080",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  10 * time.Second,
	}

	fmt.Println("Server is listening on port 8080")

	err := server.ListenAndServe()
	if err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}
