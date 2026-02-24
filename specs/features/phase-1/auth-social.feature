Feature: Social Authentication
  As a user
  I want to sign in with Google or Apple
  So that I can get started quickly without creating a password

  Scenario: Google Sign-In
    Given I am on the login page
    When I tap "Continue with Google"
    And I complete the Google OAuth flow
    Then I should be redirected to the dashboard
    And a user document should be created with authProvider "google"

  Scenario: Apple Sign-In
    Given I am on the login page
    When I tap "Continue with Apple"
    And I complete the Apple Sign-In flow
    Then I should be redirected to the dashboard
    And a user document should be created with authProvider "apple"
