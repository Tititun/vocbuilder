from django.contrib import sitemaps
from django.urls import reverse
import django
django.setup()


class StaticViewSitemap(sitemaps.Sitemap):
    priority = 0.5
    changefreq = "never"

    def items(self):
        return ['vocab:about', 'vocab:index', 'vocab:contact']

    def location(self, item):
        return reverse(item)

