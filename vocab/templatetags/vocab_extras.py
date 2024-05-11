from django import template

register = template.Library()


@register.filter(name="get_key")
def get_key(my_dict, arg):
    return my_dict[arg]