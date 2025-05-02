package index

import (
	"fmt"
	"net/http"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Welcome from the Home Controller!")
}
