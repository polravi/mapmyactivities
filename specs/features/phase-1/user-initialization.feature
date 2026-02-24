Feature: User Initialization
  As a newly registered user
  I want my account to be set up with defaults
  So that I can start using the app immediately

  Scenario: Default user document creation
    Given a new user signs up with any provider
    When the onUserCreate Cloud Function triggers
    Then a user document should exist at /users/{userId}
    And preferences.defaultView should be "today"
    And preferences.theme should be "system"
    And subscription.tier should be "free"
    And a sample "Welcome" task should exist in Q2
