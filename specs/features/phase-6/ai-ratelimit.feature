Feature: AI Rate Limiting
  As a system
  I want to limit AI requests per user
  So that costs are controlled and service is fair

  Scenario: Free user hits rate limit
    Given I am on the free tier
    And I have used 10 AI suggestions today
    When I request another suggestion
    Then I should see "Daily AI limit reached. Upgrade to Pro for unlimited."
    And the task should save without a suggestion

  Scenario: Pro user has higher limits
    Given I am on the Pro tier
    When I make 50 AI suggestion requests
    Then all 50 should succeed
