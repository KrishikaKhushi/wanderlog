import React, { useState, useEffect } from 'react';
import SuggestionCard from '../components/SuggestionCard';  // adjust path if needed
import './ExplorePage.css';

export default function ExplorePage() {
  const [suggestions, setSuggestions] = useState([]);
  const [currentSeason, setCurrentSeason] = useState('');
  const [loading, setLoading] = useState(true);

    // Generate suggestions based on current season
    const seasonalDestinations = {
      spring: [
        {
          id: 1,
          country: 'Japan',
          city: 'Tokyo & Kyoto',
          title: 'Cherry Blossom Season',
          description:
            'Experience the magical sakura season with pink cherry blossoms covering the entire country. Perfect weather for temple visits and traditional gardens.',
          bestTime: 'March - May',
          temperature: '15-22°C',
          activities: ['Cherry Blossom Viewing', 'Temple Tours', 'Traditional Gardens', 'Hot Springs'],
          image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=300&fit=crop',
          reason: 'Spring is the most beautiful time to visit Japan with mild weather and iconic cherry blossoms.',
          difficulty: 'Easy',
          budget: '$$$',
        },
        {
            id: 2,
            country: 'Netherlands',
            city: 'Amsterdam & Keukenhof',
            title: 'Tulip Festival',
            description: 'Witness millions of colorful tulips in bloom across the famous Keukenhof Gardens and countryside tulip fields.',
            bestTime: 'April - May',
            temperature: '10-18°C',
            activities: ['Tulip Gardens', 'Canal Cruises', 'Cycling Tours', 'Flower Markets'],
            image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop',
            reason: 'Spring brings the world-famous tulip season with perfect weather for outdoor activities.',
            difficulty: 'Easy',
            budget: '$$'
          },
          {
            id: 3,
            country: 'India',
            city: 'Rajasthan',
            title: 'Royal Palaces & Desert',
            description: 'Explore magnificent palaces, forts, and desert landscapes with pleasant weather before the summer heat arrives.',
            bestTime: 'March - April',
            temperature: '20-30°C',
            activities: ['Palace Tours', 'Desert Safari', 'Camel Rides', 'Cultural Shows'],
            image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop',
            reason: 'Perfect weather to explore Rajasthan before the intense summer heat begins.',
            difficulty: 'Medium',
            budget: '$'
          }
        ],
        summer: [
          {
            id: 4,
            country: 'Norway',
            city: 'Lofoten Islands',
            title: 'Midnight Sun & Fjords',
            description: 'Experience the land of the midnight sun with dramatic fjords, pristine nature, and 24-hour daylight.',
            bestTime: 'June - August',
            temperature: '15-20°C',
            activities: ['Hiking', 'Fishing', 'Midnight Sun Photography', 'Fjord Cruises'],
            image: 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=400&h=300&fit=crop',
            reason: 'Summer offers the best weather and the magical midnight sun phenomenon.',
            difficulty: 'Medium',
            budget: '$$$'
          },
          {
            id: 5,
            country: 'Greece',
            city: 'Santorini & Mykonos',
            title: 'Greek Islands Paradise',
            description: 'Perfect weather for island hopping, swimming in crystal-clear waters, and enjoying Mediterranean cuisine.',
            bestTime: 'June - September',
            temperature: '25-30°C',
            activities: ['Beach Relaxation', 'Island Hopping', 'Sunset Viewing', 'Local Cuisine'],
            image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
            reason: 'Summer is ideal for Greek islands with warm weather and calm seas.',
            difficulty: 'Easy',
            budget: '$$'
          },
          {
            id: 6,
            country: 'Russia',
            city: 'St. Petersburg',
            title: 'White Nights Festival',
            description: 'Experience the cultural capital during the magical white nights when the sun barely sets.',
            bestTime: 'June - July',
            temperature: '20-25°C',
            activities: ['Cultural Events', 'Palace Tours', 'Ballet Performances', 'River Cruises'],
            image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
            reason: 'Summer brings the famous white nights and the best weather for sightseeing.',
            difficulty: 'Easy',
            budget: '$$'
          }
        ],
        autumn: [
          {
            id: 7,
            country: 'South Korea',
            city: 'Seoul & Jeju',
            title: 'Fall Foliage Season',
            description: 'Witness stunning autumn colors across mountains and temples, with perfect weather for hiking and cultural exploration.',
            bestTime: 'October - November',
            temperature: '15-22°C',
            activities: ['Hiking', 'Temple Visits', 'Fall Photography', 'Korean BBQ'],
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
            reason: 'Autumn offers spectacular fall colors and ideal weather conditions.',
            difficulty: 'Easy',
            budget: '$$'
          },
          {
            id: 8,
            country: 'Nepal',
            city: 'Kathmandu & Pokhara',
            title: 'Himalayan Views & Trekking',
            description: 'Clear mountain views and perfect trekking weather in the Himalayas with comfortable temperatures.',
            bestTime: 'October - November',
            temperature: '10-20°C',
            activities: ['Trekking', 'Mountain Views', 'Cultural Tours', 'Monastery Visits'],
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop',
            reason: 'Post-monsoon period offers crystal clear mountain views and stable weather.',
            difficulty: 'Hard',
            budget: '$'
          },
          {
            id: 9,
            country: 'Morocco',
            city: 'Marrakech & Sahara',
            title: 'Desert Adventures',
            description: 'Comfortable temperatures for exploring vibrant markets, historic sites, and desert landscapes.',
            bestTime: 'October - November',
            temperature: '20-28°C',
            activities: ['Desert Camping', 'Souk Shopping', 'Camel Trekking', 'Atlas Mountains'],
            image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop',
            reason: 'Autumn brings relief from summer heat, perfect for desert and city exploration.',
            difficulty: 'Medium',
            budget: '$$'
          }
        ],
        winter: [
          {
            id: 10,
            country: 'Maldives',
            city: 'Malé & Resort Islands',
            title: 'Tropical Paradise Escape',
            description: 'Escape winter with pristine beaches, crystal-clear waters, and perfect weather for water activities.',
            bestTime: 'December - March',
            temperature: '26-30°C',
            activities: ['Snorkeling', 'Diving', 'Beach Relaxation', 'Water Sports'],
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            reason: 'Dry season with perfect weather for tropical activities and relaxation.',
            difficulty: 'Easy',
            budget: '$$$$'
          },
          {
            id: 11,
            country: 'Thailand',
            city: 'Bangkok & Chiang Mai',
            title: 'Cool Season Adventures',
            description: 'Perfect weather for exploring temples, markets, and natural beauty with comfortable temperatures.',
            bestTime: 'December - February',
            temperature: '20-28°C',
            activities: ['Temple Tours', 'Street Food', 'Elephant Sanctuaries', 'Beach Hopping'],
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            reason: 'Cool and dry season offers the best weather conditions for sightseeing.',
            difficulty: 'Easy',
            budget: '$'
          },
          {
            id: 12,
            country: 'Switzerland',
            city: 'Zermatt & Interlaken',
            title: 'Alpine Winter Wonderland',
            description: 'World-class skiing, snow-covered mountains, and cozy alpine villages with winter sports galore.',
            bestTime: 'December - February',
            temperature: '-5 to 5°C',
            activities: ['Skiing', 'Snowboarding', 'Mountain Railways', 'Hot Chocolate'],
            image: 'https://images.unsplash.com/photo-1551524164-6cf17ac05720?w=400&h=300&fit=crop',
            reason: 'Peak winter sports season with reliable snow and excellent facilities.',
            difficulty: 'Medium',
            budget: '$$$$'
          }
        ]
      };

    useEffect(() => {
    const getCurrentSeason = () => {
      const month = new Date().getMonth() + 1; // 1-12
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      if (month >= 9 && month <= 11) return 'autumn';
      return 'winter';
    };

    const season = getCurrentSeason();
    setCurrentSeason(season);
    setSuggestions(seasonalDestinations[season] || []);
    setLoading(false);
  }, []);

  const handleSeasonChange = (season) => {
    setCurrentSeason(season);
    setSuggestions(seasonalDestinations[season] || []);
  };

  const goToCountry = (country) => {
    alert(`Navigate to country page: ${country}`);
  };

  const getSeasonEmoji = (season) => {
    const emojis = {
      spring: '🌸',
      summer: '☀️',
      autumn: '🍂',
      winter: '❄️',
    };
    return emojis[season] || '🌍';
  };

  const getSeasonTitle = (season) => {
    const titles = {
      spring: 'Spring Adventures',
      summer: 'Summer Escapes',
      autumn: 'Autumn Wonders',
      winter: 'Winter Getaways',
    };
    return titles[season] || 'Travel Suggestions';
  };

    // Add this function above the return
    const getTopbarColor = (season) => {
        const colors = {
            spring: '#8fdcc8b0',   // minty teal green
            summer: '#ffd966b0',   // bright warm yellow-gold
            autumn: '#f4a261b0',   // soft burnt orange
            winter: '#8ecae6b0',   // frosty light blue
        };
        return colors[season] || '#f0f0f0';
    };


  if (loading) {
    return (
      <div className="explore-page">
        <div className="loading-spinner">Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div className="explore-page">
        {/* Back Button */}
        <button className="back-button" onClick={() => window.history.back()}>
            ←
        </button>

        <div
        className="season-header"
        style={{ backgroundColor: getTopbarColor(currentSeason) }}
        >
        <div className="season-topbar">
            {['spring', 'summer', 'autumn', 'winter'].map((season) => (
            <button
                key={season}
                className={`season-button ${currentSeason === season ? 'active' : ''}`}
                onClick={() => handleSeasonChange(season)}
            >
                {getSeasonEmoji(season)} {season.charAt(0).toUpperCase() + season.slice(1)}
            </button>
            ))}
        </div>

        <header className="explore-header">
            <h1>
            {getSeasonEmoji(currentSeason)} {getSeasonTitle(currentSeason)}
            </h1>
            <p className="explore-subtitle">
            Perfect destinations for {currentSeason} travel based on weather, activities, and seasonal highlights
            </p>
        </header>
        </div>

        <div className="suggestions-grid">
        {suggestions.map((suggestion) => (
            <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onExplore={() => goToCountry(suggestion.country)}
            />
        ))}
        </div>
    </div>
    );
}