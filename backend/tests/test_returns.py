"""
Test cases for Return & Exchange feature in KhajurKart
Tests: User returns, Admin returns management, Order workflows
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@khajurkart.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = f"test_user_{int(datetime.now().timestamp())}@test.com"
TEST_USER_PASSWORD = "testpass123"
TEST_USER_NAME = "Test User Returns"


class TestAuthAndSetup:
    """Authentication and user setup tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    def test_admin_login(self, session):
        """Test admin can login with correct credentials"""
        response = session.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"Admin login successful: {data['user']['email']}")
    
    def test_register_test_user(self, session):
        """Test user registration"""
        response = session.post(f"{API}/auth/register", json={
            "name": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "phone": "9876543210"
        })
        assert response.status_code == 200, f"User registration failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        print(f"Test user registered: {data['user']['email']}")


class TestReturnsAPI:
    """Test Return/Exchange API endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    @pytest.fixture(scope="class")
    def user_token(self):
        """Get test user authentication token"""
        # First register/login the user
        response = requests.post(f"{API}/auth/register", json={
            "name": TEST_USER_NAME,
            "email": f"returns_test_{int(datetime.now().timestamp())}@test.com",
            "password": TEST_USER_PASSWORD,
            "phone": "9876543210"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("User registration/login failed")
    
    def test_get_products(self):
        """Test getting products list"""
        response = requests.get(f"{API}/products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        print(f"Found {len(products)} products")
    
    def test_admin_check_endpoint(self, admin_token):
        """Test admin check endpoint"""
        response = requests.get(f"{API}/admin/check", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_admin"] == True
        print(f"Admin check passed: {data['email']}")
    
    def test_user_cannot_access_admin(self, user_token):
        """Test non-admin user cannot access admin endpoints"""
        response = requests.get(f"{API}/admin/check", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 403
        print("Non-admin correctly blocked from admin endpoints")
    
    def test_get_user_returns_empty(self, user_token):
        """Test getting user returns when empty"""
        response = requests.get(f"{API}/returns", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"User returns list retrieved: {len(data)} items")
    
    def test_get_admin_returns(self, admin_token):
        """Test admin can get all returns"""
        response = requests.get(f"{API}/admin/returns", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin returns list retrieved: {len(data)} items")
    
    def test_create_return_without_order_fails(self, user_token):
        """Test creating return without valid order fails"""
        response = requests.post(f"{API}/returns", 
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "order_id": "fake_order_123",
                "items": [{"product_id": "test", "product_name": "Test", "quantity": 1, "price": 100}],
                "reason": "Test reason",
                "request_type": "return"
            }
        )
        assert response.status_code == 404
        print("Return creation correctly rejected for invalid order")


class TestOrderAndReturnFlow:
    """Test full order -> delivery -> return flow"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    @pytest.fixture(scope="class")
    def user_data(self):
        """Register a new user for this flow"""
        email = f"flow_test_{int(datetime.now().timestamp())}@test.com"
        response = requests.post(f"{API}/auth/register", json={
            "name": "Flow Test User",
            "email": email,
            "password": TEST_USER_PASSWORD,
            "phone": "9876543210"
        })
        if response.status_code == 200:
            data = response.json()
            return {
                "token": data["access_token"],
                "user_id": data["user"]["id"],
                "email": email
            }
        pytest.skip("User registration failed")
    
    def test_create_order(self, user_data):
        """Test creating an order"""
        # Get a product first
        products_res = requests.get(f"{API}/products")
        products = products_res.json()
        product = products[0]
        
        response = requests.post(f"{API}/orders",
            headers={"Authorization": f"Bearer {user_data['token']}"},
            json={
                "items": [{
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "quantity": 1,
                    "price": product["price"]
                }],
                "total_amount": product["price"] + product.get("delivery_charge", 0),
                "payment_method": "cod",
                "shipping_address": {
                    "name": "Flow Test User",
                    "address": "123 Test Street",
                    "city": "Hyderabad",
                    "state": "Telangana",
                    "pincode": "500001",
                    "phone": "9876543210"
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "order_id" in data
        user_data["order_id"] = data["order_id"]
        print(f"Order created: {data['order_id']}")
    
    def test_get_orders(self, user_data):
        """Test getting user's orders"""
        response = requests.get(f"{API}/orders", headers={
            "Authorization": f"Bearer {user_data['token']}"
        })
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) > 0
        print(f"User has {len(orders)} orders")
    
    def test_cannot_return_non_delivered_order(self, user_data):
        """Test that return request fails for non-delivered orders"""
        if "order_id" not in user_data:
            pytest.skip("No order created")
        
        # Get order details
        response = requests.get(f"{API}/orders/{user_data['order_id']}", headers={
            "Authorization": f"Bearer {user_data['token']}"
        })
        assert response.status_code == 200
        order = response.json()
        
        # Try to create return (should fail since order is not delivered)
        response = requests.post(f"{API}/returns",
            headers={"Authorization": f"Bearer {user_data['token']}"},
            json={
                "order_id": user_data["order_id"],
                "items": order["items"],
                "reason": "Test return",
                "request_type": "return"
            }
        )
        assert response.status_code == 400
        assert "delivered" in response.json()["detail"].lower()
        print("Return correctly blocked for non-delivered order")
    
    def test_admin_update_order_to_delivered(self, admin_token, user_data):
        """Test admin can update order to delivered status"""
        if "order_id" not in user_data:
            pytest.skip("No order created")
        
        response = requests.put(
            f"{API}/admin/orders/{user_data['order_id']}/status?status=delivered",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"Order {user_data['order_id']} marked as delivered")
    
    def test_create_return_request(self, user_data):
        """Test creating return request for delivered order"""
        if "order_id" not in user_data:
            pytest.skip("No order created")
        
        # Get order details
        response = requests.get(f"{API}/orders/{user_data['order_id']}", headers={
            "Authorization": f"Bearer {user_data['token']}"
        })
        order = response.json()
        
        # Create return request
        response = requests.post(f"{API}/returns",
            headers={"Authorization": f"Bearer {user_data['token']}"},
            json={
                "order_id": user_data["order_id"],
                "items": order["items"],
                "reason": "Product not as expected - testing return flow",
                "request_type": "return"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "return_id" in data
        user_data["return_id"] = data["return_id"]
        print(f"Return request created: {data['return_id']}")
    
    def test_get_user_returns_with_data(self, user_data):
        """Test getting user returns after creating one"""
        response = requests.get(f"{API}/returns", headers={
            "Authorization": f"Bearer {user_data['token']}"
        })
        assert response.status_code == 200
        returns = response.json()
        assert len(returns) > 0
        assert returns[0]["status"] == "pending"
        print(f"User has {len(returns)} return request(s)")
    
    def test_duplicate_return_fails(self, user_data):
        """Test that duplicate return for same order fails"""
        if "order_id" not in user_data:
            pytest.skip("No order created")
        
        response = requests.get(f"{API}/orders/{user_data['order_id']}", headers={
            "Authorization": f"Bearer {user_data['token']}"
        })
        order = response.json()
        
        response = requests.post(f"{API}/returns",
            headers={"Authorization": f"Bearer {user_data['token']}"},
            json={
                "order_id": user_data["order_id"],
                "items": order["items"],
                "reason": "Duplicate request",
                "request_type": "return"
            }
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
        print("Duplicate return correctly blocked")
    
    def test_admin_approve_return(self, admin_token, user_data):
        """Test admin can approve return request"""
        if "return_id" not in user_data:
            pytest.skip("No return created")
        
        response = requests.put(
            f"{API}/admin/returns/{user_data['return_id']}/status?status=approved&admin_notes=Approved for testing",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"Return {user_data['return_id']} approved")
    
    def test_verify_return_status_updated(self, admin_token, user_data):
        """Verify return status was updated to approved"""
        response = requests.get(f"{API}/admin/returns", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        returns = response.json()
        
        # Find our return
        our_return = next((r for r in returns if r["id"] == user_data.get("return_id")), None)
        if our_return:
            assert our_return["status"] == "approved"
            assert our_return["admin_notes"] == "Approved for testing"
            print(f"Return status verified: {our_return['status']}")
    
    def test_admin_complete_return(self, admin_token, user_data):
        """Test admin can mark return as completed"""
        if "return_id" not in user_data:
            pytest.skip("No return created")
        
        response = requests.put(
            f"{API}/admin/returns/{user_data['return_id']}/status?status=completed",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"Return {user_data['return_id']} marked as completed")


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_unauthorized_access_returns(self):
        """Test unauthorized access to returns endpoint"""
        response = requests.get(f"{API}/returns")
        assert response.status_code in [401, 403]
        print("Unauthorized access correctly blocked")
    
    def test_invalid_token_returns(self):
        """Test invalid token access to returns endpoint"""
        response = requests.get(f"{API}/returns", headers={
            "Authorization": "Bearer invalid_token_123"
        })
        assert response.status_code == 401
        print("Invalid token correctly rejected")
    
    def test_invalid_return_status(self):
        """Test invalid status update is rejected"""
        admin_response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if admin_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        token = admin_response.json()["access_token"]
        
        response = requests.put(
            f"{API}/admin/returns/fake_return_123/status?status=invalid_status",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        print("Invalid status correctly rejected")
    
    def test_nonexistent_return_update(self):
        """Test update of nonexistent return fails"""
        admin_response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if admin_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        token = admin_response.json()["access_token"]
        
        response = requests.put(
            f"{API}/admin/returns/nonexistent_return/status?status=approved",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        print("Nonexistent return update correctly returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
