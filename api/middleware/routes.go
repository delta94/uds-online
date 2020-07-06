package middleware

const apiPrefix = "/api"

/*
Init Route paths
*/
var Routes = map[string]map[string]string{
	"v1": {
		"landing":       apiPrefix + "/v1/mvc/landing",
		"auth":          apiPrefix + "/v1/authenticate",
		"authAdmin":     apiPrefix + "/v1/authenticate/administration",
		"register":      apiPrefix + "/v1/register",
		"confirmEmail":  apiPrefix + "/v1/redeem/confirmation",
		"accounts":      apiPrefix + "/v1/accounts",
		"courses":       apiPrefix + "/v1/courses",
		"adminCourses":  apiPrefix + "/v1/admin/courses",
		"lessons":       apiPrefix + "/v1/lessons",
		"adminLessons":  apiPrefix + "/v1/admin/lessons",
		"resetPassword": apiPrefix + "/v1/issue-password-reset",
		"purchases":     apiPrefix + "/v1/purchases",
	},
}
