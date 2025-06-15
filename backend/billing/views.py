import os
import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @method_decorator(csrf_exempt)
    def post(self, request):
        price_id = request.data.get("price_id")
        if not price_id:
            return Response({"error": "price_id required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            frontend_base = os.getenv("FRONTEND_URL", "http://localhost:3000")
            session = stripe.checkout.Session.create(
                success_url=f"{frontend_base}/pricing?success=true",
                cancel_url=f"{frontend_base}/pricing?canceled=true",
                mode='subscription',
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                customer_email=request.user.email if request.user.is_authenticated else None,
            )
            return Response({"url": session.url})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 