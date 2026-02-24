Feature: Email Authentication
  As a new user
  I want to sign up and sign in with email
  So that I can access my personal task dashboard

  Scenario: Successful email registration
    Given I am on the registration page
    When I enter a valid email "user@example.com"
    And I enter a password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I tap "Sign Up"
    Then I should be redirected to the dashboard
    And a user document should be created in Firestore
    And the user document should have default preferences

  Scenario: Registration with weak password
    Given I am on the registration page
    When I enter a valid email "user@example.com"
    And I enter a password "123"
    And I tap "Sign Up"
    Then I should see an error "Password must be at least 8 characters"
    And no user document should be created

  Scenario: Successful email login
    Given I have an existing account with email "user@example.com"
    And I am on the login page
    When I enter email "user@example.com"
    And I enter my correct password
    And I tap "Sign In"
    Then I should be redirected to the dashboard
    And I should see my display name in the header

  Scenario: Login with wrong password
    Given I have an existing account with email "user@example.com"
    And I am on the login page
    When I enter email "user@example.com"
    And I enter an incorrect password
    And I tap "Sign In"
    Then I should see an error "Invalid email or password"

  Scenario: Unauthenticated user is redirected
    Given I am not signed in
    When I try to access the dashboard
    Then I should be redirected to the login page
