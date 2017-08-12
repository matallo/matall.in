module Jekyll
  class BirthdayYearsTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @birthday = text
    end

    def render(context)
      ((Date.today - Date.parse(context[@birthday.strip])).to_i / 365).round
    end
  end
end

Liquid::Template.register_tag('birthday_years', Jekyll::BirthdayYearsTag)
