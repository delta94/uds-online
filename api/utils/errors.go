package utils

var ErrAuth = 1001             // Authentication missing/corrupted
var ErrLogin = 1002            // Login failed
var ErrMailNotConfirmed = 1003 // Login failed
var ErrAuthUserNotFound = 1004 // User not found / login failed
var ErrAccBlocked = 1005       // User not found / login failed
var ErrForbidden = 1006        // Forbidden
var ErrDBConnection = 1010     // Cannot connect

var ErrGeneral = 2001  // General
var ErrNotFound = 2002 // Not Found
