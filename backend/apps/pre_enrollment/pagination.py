# pagination.py
from rest_framework.pagination import PageNumberPagination

class BeneficiaryPagination(PageNumberPagination):
    page_size = 10  # Number of results per page
    page_size_query_param = 'page_size'
    max_page_size = 100
