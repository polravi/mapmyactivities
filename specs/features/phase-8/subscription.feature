Feature: Subscription & Feature Gating
  As a user
  I want to upgrade to Pro for unlimited features
  So that I can use AI and voice without limits

  Scenario: Free user sees upgrade prompt at task limit
    Given I am on the free tier
    And I have 50 tasks
    When I try to create a new task
    Then I should see "Task limit reached. Upgrade to Pro for unlimited tasks."

  Scenario: Pro user has unlimited tasks
    Given I am on the Pro tier
    When I create my 51st task
    Then the task should be created successfully

  Scenario: Successful Pro upgrade (web)
    Given I am on the free tier on the web app
    When I tap "Upgrade to Pro"
    And I complete the Stripe checkout
    Then my subscription.tier should update to "pro"
    And I should see "Welcome to Pro!" confirmation
