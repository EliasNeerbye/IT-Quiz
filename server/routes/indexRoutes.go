package routes

import (
	"it-quiz/controllers/index"
	"net/http"
)

func SetupIndexRoutes() {
	http.HandleFunc("/", index.HomeHandler)
}
