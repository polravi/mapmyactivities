Feature: New User Onboarding
  As a first-time user
  I want a quick walkthrough of key features
  So that I understand how to use the app effectively

  Scenario: Onboarding shown on first login
    Given I just created my account
    When I reach the dashboard for the first time
    Then I should see the onboarding walkthrough
    And it should have 3 screens: Matrix, Goals, Voice

  Scenario: Skip onboarding
    Given I am on the onboarding walkthrough
    When I tap "Skip"
    Then I should go to the dashboard
    And onboarding should not show again

  Scenario: Onboarding not shown on subsequent logins
    Given I have completed or skipped onboarding
    When I sign in again
    Then I should go directly to the dashboard
