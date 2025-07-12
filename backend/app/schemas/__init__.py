# Simplified schema imports
# Only import what exists and is needed

try:
    from .user import UserBase, UserCreate, UserUpdate, UserRead, UserResponse, Token
except ImportError:
    pass

try:
    from .company import CompanyCreate, CompanyUpdate, CompanyResponse
except ImportError:
    pass

try:
    from .document import DocumentCreate, DocumentUpdate, DocumentResponse
except ImportError:
    pass

try:
    from .alert import AlertCreate, AlertUpdate, AlertResponse
except ImportError:
    pass

# Empty file for now - avoid import conflicts
