# Documentation for the REST transaction API

Note that **all** requests that are not about logging in or out are authenticated 
before a request is exectued, unless otherwise noted

## /buttons
Returns all buttons in benek020.till_buttons

## /click
Inserts a row into benek020.button_pushes with the id of the button, the current time, 
and the current transaction ID

## /ticketize
Returns a breakdown of the items in the transaction, what the total cost of each item is, 
and the total cost of teh transaction. To be used for a receipt, client-side

## /getTrans
Returns the items, quantity, and prices of those items from the current transaction

## /removeItem
Requires parameter bid corresponding to the button id

deletes the most recent click of that item from button_pushes

## /login
requires parameters user and pass as the username and password, unencrypted because who needs
security

Checks to see if the username and corresponding hashed (SHA-256) password are in the table 
`users`, if they are we give the client a cookie with their userID and a random number 
between 0 and 1000000000000000, also inserts those values into the `cookies` table. 

## /logout
Deletes the row in the table `cookies` corresponding to their id

Note: this is not authenticated, but maybe it should be

## /sale
Requires params `total` and `voided` (a boolean)

Changes the currentTransId for the user and inserts into the `transaction` table with
all of the corresponding information
