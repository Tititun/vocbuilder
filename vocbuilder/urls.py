"""
URL configuration for vocbuilder project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.generic.base import RedirectView
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sitemaps.views import sitemap
from graphene_django.views import GraphQLView
from vocbuilder.schema import schema

from .sitemaps import StaticViewSitemap

sitemaps = {
    "static": StaticViewSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('vocab/images/favicon.svg'))),
    # TODO: handle csrf in GraphQL more gracefully:
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=True,
                                                    schema=schema))),
    path('sitemap.xml', sitemap,  {"sitemaps": sitemaps},
         name='django.contrib.sitemaps.views.sitemap'),
    # path("__debug__/", include("debug_toolbar.urls")),
    path('', include('vocab.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)