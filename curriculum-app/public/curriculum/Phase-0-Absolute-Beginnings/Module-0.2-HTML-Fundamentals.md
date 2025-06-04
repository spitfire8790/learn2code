# Module 0.2: HTML Fundamentals

## Learning Objectives

By the end of this module, you will be able to:

- Understand HTML's role in structuring web content
- Create semantic, accessible HTML for property websites
- Build forms for property search and contact functionality
- Implement proper document structure and organisation
- Apply best practices for HTML in professional property applications

## Prerequisites

- Completion of Module 0.1: Development Environment Setup
- Basic understanding of file and folder organisation
- VS Code installed with Live Server extension

## Introduction

HTML (HyperText Markup Language) is the foundation of every website and web application. Think of HTML as the skeleton that gives structure to your content - just as a house needs a strong frame before adding walls and decoration, a website needs proper HTML structure before adding styles and interactivity.

For property websites, HTML becomes particularly important because you'll be presenting complex information clearly: property details, pricing, features, contact forms, and search functionality. Well-structured HTML ensures your content is accessible to all users, including those using screen readers, and provides a solid foundation for styling and functionality.

## Section 1: Understanding HTML Structure

### The Building Blocks of HTML

HTML works through **elements** - pieces of content wrapped in **tags**. Think of tags as containers that give meaning to your content.

**Basic Structure Pattern:**

```
<opening-tag>Content</closing-tag>
```

**Why this matters for property websites:**

- Search engines understand your content better
- Screen readers can navigate your site effectively
- Styling becomes more predictable and maintainable
- Other developers can easily understand your code

### Document Structure Foundation

Every HTML document follows a standard structure, like the blueprint of a house:

```html
<!DOCTYPE html>
<!-- Tells the browser this is an HTML5 document, the modern standard -->
<html lang="en">
  <!-- The root element of the HTML page; 'lang="en"' declares the language as English -->
  <head>
    <!-- Information about the HTML document (metadata) that is NOT visible on the page itself -->
    <!-- Examples: character set, viewport settings, page title, links to CSS files, etc. -->
    <meta charset="UTF-8" />
    <!-- Specifies the character encoding for the document (UTF-8 is recommended) -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Configures the viewport for responsiveness on different devices -->
    <title>My Property Website</title>
    <!-- The title that appears in the browser tab and search engine results -->
    <link rel="stylesheet" href="style.css" />
    <!-- Links an external CSS file for styling -->
  </head>
  <body>
    <!-- All the VISIBLE content of the HTML document goes here -->
    <!-- Examples: headings, paragraphs, images, links, forms, etc. -->
    <h1>Welcome to My Property Site</h1>
    <p>Find your dream property here.</p>
  </body>
</html>
```

**Each part serves a specific purpose:**

- **DOCTYPE**: Tells the browser this is modern HTML5
- **html element**: The root container for everything
- **head section**: Metadata that browsers and search engines need
- **body section**: All the visible content users see

**For property websites, the head section typically includes:**

- Page title (crucial for search engine results)
- Description (appears in search results)
- Keywords related to property and location
- Links to stylesheets and fonts
- Viewport settings for mobile responsiveness

### Semantic HTML: Giving Meaning to Content

Semantic HTML means choosing tags based on **meaning** rather than appearance. This is crucial for property websites because it improves:

- **Search engine optimisation**: Better ranking in property searches
- **Accessibility**: Screen readers understand your content structure
- **Maintainability**: Code is easier to update and modify

**Examples of semantic choices for property content:**

Instead of generic divs:

```html
<!-- Problem: These <div> tags don't describe the content's meaning or role. -->
<!-- This makes it harder for search engines and assistive technologies (like screen readers) to understand the page structure. -->
<div>Featured Properties</div>
<div>This luxury home features...</div>
```

Use meaningful elements:

```html
<!-- Solution: Use semantic HTML elements that clearly define the content's purpose. -->
<!-- <h2> indicates a secondary heading, and <p> indicates a paragraph. -->
<!-- This improves SEO, accessibility, and code readability. -->
<h2>Featured Properties</h2>
<p>This luxury home features...</p>
```

**Key semantic elements for property websites:**

- `<header>`: Site navigation and branding
- `<main>`: Primary content area
- `<section>`: Distinct content sections (property listings, contact info)
- `<article>`: Individual property listings
- `<aside>`: Sidebar content (filters, related properties)
- `<footer>`: Contact information, legal notices

## Section 2: Content Structure for Property Websites

### Headings: Creating Content Hierarchy

Headings create a logical structure that helps users scan content and find what they need quickly. For property websites, this structure might look like:

- **H1**: Main page title (only one per page)
- **H2**: Major sections (Featured Properties, About Us, Contact)
- **H3**: Property titles or subsections
- **H4**: Property features or details
- **H5-H6**: Minor details (rarely needed)

**Why heading hierarchy matters:**

- Users can quickly scan for relevant information
- Search engines understand your content organisation
- Screen readers can jump between sections efficiently
- Styling becomes more consistent and maintainable

### Paragraphs and Text Content

Paragraphs (`<p>`) are the workhorses of content presentation. For property descriptions, proper paragraph structure improves readability:

**Guidelines for property content:**

- Keep paragraphs focused on one main idea
- Use shorter paragraphs for better online reading
- Start with the most important information
- Include specific details that matter to property buyers

### Lists: Organising Property Information

Lists are perfect for presenting property features, amenities, and specifications:

**Unordered lists** for features without priority order:

- Modern kitchen with granite benchtops
- Three spacious bedrooms with built-in wardrobes
- Two bathrooms including ensuite
- Double garage with internal access

**Ordered lists** for step-by-step processes:

1. Schedule a property inspection
2. Submit your application
3. Attend the property interview
4. Receive approval confirmation

**Definition lists** for property specifications:

- **Property Type**: Detached House
- **Land Size**: 650 square metres
- **Building Area**: 180 square metres
- **Year Built**: 2019

### Links: Connecting Property Information

Links connect related information and enable user navigation. For property websites, consider these link types:

**Navigation links**: Connect to main site sections
**Property detail links**: Lead to full property information
**External links**: Connect to maps, schools, or local amenities
**Contact links**: Enable phone calls or email communication

**Best practices for property website links:**

- Use descriptive text that explains the destination
- Indicate when links open in new windows
- Ensure links work on touch devices
- Consider link styling for visibility and accessibility

## Section 3: Images and Media for Property Content

### Image Integration Best Practices

Property websites are inherently visual, making proper image implementation crucial:

**Essential image considerations:**

- **Alt text**: Describes images for screen readers and when images fail to load
- **File size**: Optimise for fast loading without sacrificing quality
- **Responsive sizing**: Images that work on all device sizes
- **File formats**: Choose appropriate formats for different image types

**Alt text examples for property images:**

- Good: "Modern kitchen with white cabinets and granite benchtops"
- Poor: "Kitchen" or "IMG_1234"

### Responsive Image Strategy

Property images need to look good on everything from mobile phones to large desktop displays:

**Key considerations:**

- Different image sizes for different screen sizes
- Optimal loading performance on slower connections
- Consistent aspect ratios for gallery layouts
- Fallback options when images don't load

## Section 4: Forms for Property Websites

### Understanding Form Purpose

Forms enable user interaction and are essential for property websites:

- **Search forms**: Help users find properties matching their criteria
- **Contact forms**: Enable inquiries about specific properties
- **Application forms**: Collect information from potential tenants
- **Newsletter signup**: Build mailing lists for property updates

### Form Structure and Organisation

Well-structured forms improve user experience and increase completion rates:

**Form organisation principles:**

- Group related information together
- Use clear, descriptive labels
- Provide helpful placeholder text
- Indicate required fields clearly
- Include validation feedback

**Typical property search form structure:**

1. **Location criteria**: Suburb, region, or postcode
2. **Property type**: House, apartment, townhouse
3. **Price range**: Minimum and maximum budget
4. **Property features**: Bedrooms, bathrooms, parking
5. **Additional filters**: Pool, garden, pets allowed

### Input Types for Property Data

Different input types provide better user experience for different data:

- **Text inputs**: Names, addresses, general comments
- **Number inputs**: Price ranges, property sizes, bedroom counts
- **Email inputs**: Contact information with validation
- **Phone inputs**: Phone numbers with appropriate formatting
- **Select dropdowns**: Property types, locations, features
- **Checkboxes**: Multiple property features or amenities
- **Radio buttons**: Exclusive choices like property condition

### Form Accessibility and Usability

Accessible forms work for all users and improve overall usability:

**Essential accessibility features:**

- Labels clearly associated with form controls
- Keyboard navigation support
- Error messages that explain how to fix problems
- Sufficient colour contrast for visibility
- Clear indication of required fields

## Section 5: Accessibility in Property Websites

### Why Accessibility Matters

Accessible websites serve all users, including those with disabilities. For property websites, accessibility is particularly important because:

- Housing is a fundamental need for everyone
- Legal requirements in many jurisdictions
- Larger potential customer base
- Better search engine optimisation

### Implementing Accessible HTML

**Key accessibility principles:**

**Semantic structure**: Use HTML elements for their intended purpose
**Keyboard navigation**: Ensure all functionality works without a mouse
**Alternative text**: Provide text alternatives for images and visual content
**Clear language**: Use plain language that's easy to understand
**Consistent navigation**: Maintain predictable site structure

### Testing Accessibility

Regular testing ensures your property website remains accessible:

**Testing approaches:**

- Navigate using only the keyboard
- Use screen reader software to experience your site
- Check colour contrast for text visibility
- Validate HTML for proper structure
- Test with automated accessibility tools

## Section 6: SEO Foundations for Property Websites

### HTML's Role in Search Engine Optimisation

Proper HTML structure significantly impacts how search engines understand and rank your property website:

**Title elements**: Appear in search results and browser tabs
**Meta descriptions**: Influence click-through rates from search results
**Heading structure**: Helps search engines understand content hierarchy
**Semantic markup**: Provides context about property information

### Property-Specific SEO Considerations

Property websites have unique SEO opportunities:

**Location-based content**: Include suburb, city, and region information
**Property details**: Specific features that people search for
**Local landmarks**: Schools, transport, shopping centres
**Market information**: Price ranges, property types, market trends

## Practical Exercises

### Exercise 1: Property Card Structure

Create a semantic HTML structure for a property listing card:

1. Plan the information hierarchy
2. Choose appropriate semantic elements
3. Structure the content logically
4. Test with screen reader simulation

### Exercise 2: Property Search Form

Build a comprehensive property search form:

1. Identify necessary search criteria
2. Choose appropriate input types
3. Group related fields logically
4. Add proper labels and accessibility features

### Exercise 3: Property Detail Page

Develop a complete property detail page:

1. Structure property information hierarchically
2. Include image gallery with proper alt text
3. Add contact and inquiry forms
4. Implement accessible navigation

## Summary

This module established the foundation for creating well-structured, accessible HTML for property websites. You now understand:

- **HTML structure and syntax** for building proper document foundations
- **Semantic HTML elements** that provide meaning and improve accessibility
- **Content organisation** using headings, paragraphs, lists, and links
- **Form creation** for property search and user interaction
- **Accessibility principles** that make websites usable for everyone
- **SEO fundamentals** that help property content rank in search results

These HTML skills provide the essential foundation for building professional property websites that work well for all users and perform effectively in search engines.

## Navigation

- [← Previous: Module 0.1 - Development Environment Setup](./Module-0.1-Development-Environment-Setup.md)
- [Next: Module 0.3 - CSS Fundamentals →](./Module-0.3-CSS-Fundamentals.md)
- [↑ Back to Phase 0 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)
