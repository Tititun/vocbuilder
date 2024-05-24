from django import forms
from .models import Feedback
from django.core.exceptions import ValidationError


class FeedbackForm(forms.ModelForm):

    def clean_file(self):
        data = self.cleaned_data['file']
        if data and data.size > 100 * 1024 * 1024:
            raise ValidationError('File size shouldn\'t exceed 100 Mb')
        return data

    class Meta:
        model = Feedback
        fields = ['email', 'feedback', 'file']
        widgets = {
             'email': forms.EmailInput(attrs={
                     'class': "form-control",
                     'placeholder': 'if you want an answer, you may provide your email'
             }),
             'feedback': forms.Textarea(attrs={
                 'class': "form-control",
                 'rows': '3'
             }),
             'file': forms.FileInput(attrs={
                'class': "form-control",
                'accept': '.db,image/*',
             }),
         }
