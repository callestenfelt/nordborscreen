#!/usr/bin/env node

/**
 * Content Fetcher Script
 * Fetches content from Nordiska museet guide and extracts to JSON files
 *
 * Usage: node scripts/fetch-content.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://guide.nordiskamuseet.se';
const THEME_PATH = '/sv/1500-tal/skogen/samerna-handlar-med-dyra-palsverk/';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OBJECTS_DIR = path.join(OUTPUT_DIR, 'objects');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(OBJECTS_DIR)) fs.mkdirSync(OBJECTS_DIR, { recursive: true });

/**
 * Fetch HTML from URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchHTML(res.headers.location).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Extract text content between patterns
 */
function extractBetween(html, startPattern, endPattern) {
  const startIndex = html.indexOf(startPattern);
  if (startIndex === -1) return null;

  const searchStart = startIndex + startPattern.length;
  const endIndex = html.indexOf(endPattern, searchStart);
  if (endIndex === -1) return null;

  return html.substring(searchStart, endIndex).trim();
}

/**
 * Extract all matches of a pattern
 */
function extractAllMatches(html, regex) {
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match);
  }
  return matches;
}

/**
 * Clean HTML tags from text
 */
function cleanHTML(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract object links from theme page HTML
 */
function extractObjectLinks(html) {
  const objects = [];

  // Look for object links in the HTML
  const linkRegex = /href="(\/sv\/1500-tal\/skogen\/samerna-handlar-med-dyra-palsverk\/([^\/]+)\/)"/g;
  const matches = extractAllMatches(html, linkRegex);

  matches.forEach(match => {
    const [, fullPath, objectId] = match;
    if (objectId && objectId !== 'description') {
      objects.push({
        id: objectId,
        path: fullPath
      });
    }
  });

  // Remove duplicates
  const seen = new Set();
  return objects.filter(obj => {
    if (seen.has(obj.id)) return false;
    seen.add(obj.id);
    return true;
  });
}

/**
 * Extract title from HTML
 */
function extractTitle(html) {
  // Try different patterns for title
  const patterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title>([^<]+)<\/title>/i,
    /class="[^"]*heading[^"]*"[^>]*>([^<]+)</i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return cleanHTML(match[1]);
  }

  return 'Untitled';
}

/**
 * Extract ingress/intro text
 */
function extractIngress(html) {
  // Look for paragraph after title or with specific classes
  const patterns = [
    /<p[^>]*class="[^"]*ingress[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/p>/i,
    /<p[^>]*class="[^"]*paragraph[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/p>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return cleanHTML(match[1]);
  }

  // Fallback: first substantial paragraph
  const pMatch = html.match(/<p[^>]*>([^<]{50,}(?:<[^>]+>[^<]*)*)<\/p>/i);
  if (pMatch) return cleanHTML(pMatch[1]);

  return '';
}

/**
 * Extract image URLs from object page
 */
function extractImages(html) {
  const images = [];
  const imgRegex = /src="(\/media\/[^"]+\.webp)"/g;
  const matches = extractAllMatches(html, imgRegex);

  matches.forEach(match => {
    const imgPath = match[1];
    if (imgPath && !images.includes(BASE_URL + imgPath)) {
      images.push(BASE_URL + imgPath);
    }
  });

  return images;
}

/**
 * Extract object number
 */
function extractObjectNumber(html) {
  const patterns = [
    /NM[\.\s]?(\d+[A-Za-z]?)/i,
    /foremalsnummer[^:]*:\s*([^\s<]+)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[0];
  }

  return '';
}

/**
 * Extract description sections
 */
function extractDescription(html) {
  const sections = [];

  // Extract headings
  const headingRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    sections.push({
      type: 'heading',
      text: cleanHTML(headingMatch[1]),
      index: headingMatch.index
    });
  }

  // Extract paragraphs
  const paraRegex = /<p[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/p>/gi;
  let paraMatch;
  while ((paraMatch = paraRegex.exec(html)) !== null) {
    const text = cleanHTML(paraMatch[1]);
    if (text.length > 20) {
      sections.push({
        type: 'paragraph',
        text: text,
        index: paraMatch.index
      });
    }
  }

  // Sort by position in document
  sections.sort((a, b) => a.index - b.index);

  // Remove index from output
  return sections.map(({ type, text }) => ({ type, text }));
}

/**
 * Generate thumbnail URL from default image URL
 */
function getThumbnailUrl(imageUrl) {
  return imageUrl.replace('-default.webp', '-thumbnail.webp');
}

/**
 * Fetch and process theme page
 */
async function fetchThemePage() {
  console.log('Fetching theme page...');
  const url = BASE_URL + THEME_PATH;
  const html = await fetchHTML(url);

  const title = extractTitle(html);
  const ingress = extractIngress(html);
  const objectLinks = extractObjectLinks(html);

  console.log(`Found ${objectLinks.length} objects`);

  // For now, split objects into primary (first 9) and secondary (rest)
  const primaryObjects = objectLinks.slice(0, 9);
  const secondaryObjects = objectLinks.slice(9);

  return {
    title,
    ingress,
    primaryObjectIds: primaryObjects.map(o => o.id),
    secondaryObjectIds: secondaryObjects.map(o => o.id),
    allObjects: objectLinks
  };
}

/**
 * Fetch and process a single object
 */
async function fetchObject(objectId, objectPath) {
  console.log(`  Fetching object: ${objectId}`);

  try {
    // Fetch main object page
    const objectUrl = BASE_URL + objectPath;
    const objectHtml = await fetchHTML(objectUrl);

    // Fetch description page
    const descUrl = objectUrl + 'description/';
    let descHtml = '';
    try {
      descHtml = await fetchHTML(descUrl);
    } catch (e) {
      console.log(`    No description page for ${objectId}`);
    }

    const title = extractTitle(objectHtml);
    const images = extractImages(objectHtml);
    const objectNumber = extractObjectNumber(objectHtml);
    const intro = extractIngress(objectHtml);
    const description = descHtml ? extractDescription(descHtml) : { sections: [] };

    // Get thumbnail
    const thumbnail = images.length > 0
      ? getThumbnailUrl(images[0])
      : `${BASE_URL}/media/placeholder-thumbnail.webp`;

    return {
      id: objectId,
      title,
      objectNumber,
      images,
      thumbnail,
      intro,
      description: { sections: description },
      timeline: {
        periods: [
          { label: '1500-tal', active: true },
          { label: '1600-tal', active: false },
          { label: '1700-tal', active: false },
          { label: '1800-tal', active: false },
          { label: '1900-tal', active: false },
          { label: '2000-tal', active: false }
        ]
      }
    };
  } catch (error) {
    console.error(`    Error fetching object ${objectId}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting content fetch...\n');

  try {
    // Fetch theme page
    const themeData = await fetchThemePage();

    // Fetch all objects
    console.log('\nFetching objects...');
    const primaryObjects = [];
    const secondaryObjects = [];

    for (const obj of themeData.allObjects) {
      const objectData = await fetchObject(obj.id, obj.path);

      if (objectData) {
        // Save individual object file
        const objectPath = path.join(OBJECTS_DIR, `${obj.id}.json`);
        fs.writeFileSync(objectPath, JSON.stringify(objectData, null, 2));

        // Create summary for theme file
        const summary = {
          id: objectData.id,
          title: objectData.title,
          thumbnail: objectData.thumbnail
        };

        if (themeData.primaryObjectIds.includes(obj.id)) {
          primaryObjects.push(summary);
        } else {
          secondaryObjects.push(summary);
        }
      }

      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Save theme file
    const themeOutput = {
      title: themeData.title,
      ingress: themeData.ingress,
      primaryObjects,
      secondaryObjects
    };

    const themePath = path.join(OUTPUT_DIR, 'theme.json');
    fs.writeFileSync(themePath, JSON.stringify(themeOutput, null, 2));

    console.log(`\nDone! Saved:`);
    console.log(`  - ${themePath}`);
    console.log(`  - ${primaryObjects.length + secondaryObjects.length} object files in ${OBJECTS_DIR}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
