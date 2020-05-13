package middleware

const apiPrefix = "/api"

/*
Init Route paths
*/
var Routes = map[string]map[string]string{
	"v1": {
		"authentication": apiPrefix + "/v1/authenticate",
		"register":       apiPrefix + "/v1/register",
		"confirmEmail":   apiPrefix + "/v1/redeem/confirmation",
		"accounts":       apiPrefix + "/v1/accounts",
		"resetPassword":  apiPrefix + "/v1/issue-password-reset",
	},
}
