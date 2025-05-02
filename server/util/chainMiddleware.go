package util

import "net/http"

type Middleware func(http.Handler) http.Handler

func Chain(handler http.Handler, middleware ...Middleware) http.Handler {
	h := handler

	for i := len(middleware) - 1; i >= 0; i-- {
		h = middleware[i](h)
	}

	return h
}
