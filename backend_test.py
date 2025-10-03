#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import time

class AIUsageAnalyzerTester:
    def __init__(self, base_url="https://promptsight.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = "Bearer demo-token"
        self.headers = {
            'Authorization': self.token,
            'Content-Type': 'application/json'
        }
        self.tests_run = 0
        self.tests_passed = 0
        self.created_event_ids = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", headers=self.headers, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            return self.log_test("API Root", success, details)
        except Exception as e:
            return self.log_test("API Root", False, f"Error: {str(e)}")

    def test_create_single_event(self):
        """Test creating a single AI usage event"""
        try:
            event_data = {
                "provider": "openai",
                "model": "gpt-4",
                "event_type": "text_generation",
                "user_id": "test-user-001",
                "service": "test-service",
                "prompt_tokens": 100,
                "completion_tokens": 50,
                "total_tokens": 150,
                "cost_usd": 0.003,
                "prompt": "Test prompt for API testing",
                "response": "Test response from API",
                "metadata": {"test": True, "api_test": "single_event"}
            }
            
            response = requests.post(
                f"{self.api_url}/v1/ai-usage/events", 
                json=event_data, 
                headers=self.headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.created_event_ids.append(data.get('id'))
                details += f", Event ID: {data.get('id')[:8]}..."
                
                # Verify required fields
                required_fields = ['id', 'timestamp', 'provider', 'model', 'event_type']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                    
            return self.log_test("Create Single Event", success, details)
            
        except Exception as e:
            return self.log_test("Create Single Event", False, f"Error: {str(e)}")

    def test_create_batch_events(self):
        """Test creating batch AI usage events"""
        try:
            batch_data = {
                "events": [
                    {
                        "provider": "anthropic",
                        "model": "claude-3-opus",
                        "event_type": "text_generation",
                        "user_id": "test-user-002",
                        "service": "batch-test-service",
                        "prompt_tokens": 200,
                        "completion_tokens": 100,
                        "total_tokens": 300,
                        "cost_usd": 0.006,
                        "prompt": "Batch test prompt 1",
                        "response": "Batch test response 1",
                        "metadata": {"test": True, "batch_index": 1}
                    },
                    {
                        "provider": "google",
                        "model": "gemini-pro",
                        "event_type": "text_generation",
                        "user_id": "test-user-003",
                        "service": "batch-test-service",
                        "prompt_tokens": 150,
                        "completion_tokens": 75,
                        "total_tokens": 225,
                        "cost_usd": 0.0045,
                        "prompt": "Batch test prompt 2",
                        "response": "Batch test response 2",
                        "metadata": {"test": True, "batch_index": 2}
                    }
                ]
            }
            
            response = requests.post(
                f"{self.api_url}/v1/ai-usage/events/batch", 
                json=batch_data, 
                headers=self.headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if isinstance(data, list) and len(data) == 2:
                    for event in data:
                        self.created_event_ids.append(event.get('id'))
                    details += f", Created {len(data)} events"
                else:
                    success = False
                    details += f", Expected 2 events, got {len(data) if isinstance(data, list) else 'non-list'}"
                    
            return self.log_test("Create Batch Events", success, details)
            
        except Exception as e:
            return self.log_test("Create Batch Events", False, f"Error: {str(e)}")

    def test_get_events(self):
        """Test retrieving events with filters"""
        try:
            # Test basic event retrieval
            response = requests.get(
                f"{self.api_url}/v1/ai-usage/events?limit=10", 
                headers=self.headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    details += f", Retrieved {len(data)} events"
                    
                    # Test with filters
                    filter_response = requests.get(
                        f"{self.api_url}/v1/ai-usage/events?provider=openai&limit=5", 
                        headers=self.headers,
                        timeout=10
                    )
                    
                    if filter_response.status_code == 200:
                        filter_data = filter_response.json()
                        details += f", Filtered: {len(filter_data)} OpenAI events"
                    else:
                        success = False
                        details += f", Filter test failed: {filter_response.status_code}"
                else:
                    success = False
                    details += ", Response is not a list"
                    
            return self.log_test("Get Events", success, details)
            
        except Exception as e:
            return self.log_test("Get Events", False, f"Error: {str(e)}")

    def test_get_analytics(self):
        """Test analytics endpoint"""
        try:
            response = requests.get(
                f"{self.api_url}/v1/ai-usage/analytics?days=7", 
                headers=self.headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = [
                    'total_events', 'total_cost', 'events_last_24h', 
                    'cost_last_24h', 'top_models', 'top_users', 
                    'top_services', 'usage_over_time'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", Total events: {data.get('total_events', 0)}"
                    details += f", Total cost: ${data.get('total_cost', 0):.4f}"
                    
            return self.log_test("Get Analytics", success, details)
            
        except Exception as e:
            return self.log_test("Get Analytics", False, f"Error: {str(e)}")

    def test_generate_demo_data(self):
        """Test demo data generation"""
        try:
            response = requests.post(
                f"{self.api_url}/v1/ai-usage/generate-demo-data?count=10", 
                json={},
                headers=self.headers,
                timeout=15
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if 'count' in data:
                    details += f", Generated {data['count']} demo events"
                else:
                    success = False
                    details += ", Missing count in response"
                    
            return self.log_test("Generate Demo Data", success, details)
            
        except Exception as e:
            return self.log_test("Generate Demo Data", False, f"Error: {str(e)}")

    def test_pii_detection(self):
        """Test PII detection functionality"""
        try:
            event_data = {
                "provider": "openai",
                "model": "gpt-4",
                "event_type": "text_generation",
                "user_id": "pii-test-user",
                "service": "pii-test-service",
                "prompt_tokens": 50,
                "completion_tokens": 25,
                "total_tokens": 75,
                "prompt": "My email is john.doe@example.com and my SSN is 123-45-6789",
                "response": "I understand your request",
                "metadata": {"pii_test": True}
            }
            
            response = requests.post(
                f"{self.api_url}/v1/ai-usage/events", 
                json=event_data, 
                headers=self.headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.created_event_ids.append(data.get('id'))
                
                # Check PII detection
                if data.get('has_pii') == True:
                    details += ", PII detected correctly"
                    if 'redacted_prompt' in data and '[REDACTED-' in data['redacted_prompt']:
                        details += ", PII redacted correctly"
                    else:
                        success = False
                        details += ", PII not redacted properly"
                else:
                    success = False
                    details += ", PII not detected"
                    
            return self.log_test("PII Detection", success, details)
            
        except Exception as e:
            return self.log_test("PII Detection", False, f"Error: {str(e)}")

    def test_cost_calculation(self):
        """Test automatic cost calculation"""
        try:
            event_data = {
                "provider": "openai",
                "model": "gpt-4",
                "event_type": "text_generation",
                "user_id": "cost-test-user",
                "service": "cost-test-service",
                "prompt_tokens": 1000,
                "completion_tokens": 500,
                "total_tokens": 1500,
                # No cost_usd provided - should be calculated automatically
                "prompt": "Test prompt for cost calculation",
                "response": "Test response",
                "metadata": {"cost_test": True}
            }
            
            response = requests.post(
                f"{self.api_url}/v1/ai-usage/events", 
                json=event_data, 
                headers=self.headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.created_event_ids.append(data.get('id'))
                
                # Check if cost was calculated
                if 'cost_usd' in data and data['cost_usd'] > 0:
                    calculated_cost = data['cost_usd']
                    expected_cost = 1500 * 0.00002  # Basic calculation
                    details += f", Cost calculated: ${calculated_cost:.6f}"
                    
                    # Allow some variance in calculation
                    if abs(calculated_cost - expected_cost) < 0.001:
                        details += " (within expected range)"
                    else:
                        details += f" (expected ~${expected_cost:.6f})"
                else:
                    success = False
                    details += ", Cost not calculated"
                    
            return self.log_test("Cost Calculation", success, details)
            
        except Exception as e:
            return self.log_test("Cost Calculation", False, f"Error: {str(e)}")

    def test_error_handling(self):
        """Test API error handling"""
        try:
            # Test invalid data
            invalid_data = {
                "provider": "invalid_provider",  # Invalid enum value
                "model": "test-model",
                "event_type": "text_generation",
                "user_id": "error-test-user",
                "service": "error-test-service"
            }
            
            response = requests.post(
                f"{self.api_url}/v1/ai-usage/events", 
                json=invalid_data, 
                headers=self.headers,
                timeout=10
            )
            
            # Should return 422 for validation error
            success = response.status_code == 422
            details = f"Status: {response.status_code}"
            
            if success:
                details += ", Validation error handled correctly"
            else:
                details += ", Expected 422 validation error"
                
            return self.log_test("Error Handling", success, details)
            
        except Exception as e:
            return self.log_test("Error Handling", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AI Usage Analyzer API Tests")
        print("=" * 50)
        
        # Basic connectivity
        self.test_api_root()
        
        # Core functionality
        self.test_create_single_event()
        self.test_create_batch_events()
        self.test_get_events()
        self.test_get_analytics()
        
        # Advanced features
        self.test_pii_detection()
        self.test_cost_calculation()
        self.test_generate_demo_data()
        
        # Error handling
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.created_event_ids:
            print(f"📝 Created {len(self.created_event_ids)} test events")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Backend API tests PASSED!")
            return 0
        else:
            print("❌ Backend API tests FAILED!")
            return 1

def main():
    tester = AIUsageAnalyzerTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())