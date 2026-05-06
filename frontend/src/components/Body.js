import RestaurantCard from "./RestaurantCard";
import {useState,useEffect} from "react";
import Shimmer from "./Shimmer";
import {Link} from "react-router-dom";
import { API_BASE_URL } from "../utils/constants";


const Body = () => {
  //local state variable
  const [ListOfRestaurant,setListOfRestaurant]=useState([]);
  const [filteredRestaurants,setFilteredRestaurants]=useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [fetchError, setFetchError] = useState("");
  const [showTopRatedOnly, setShowTopRatedOnly] = useState(false);

  const getRestaurantRating = (restaurant) => {
    const rawRating =
      restaurant?.info?.avgRating ??
      restaurant?.info?.avgRatingString ??
      "0";
    const parsedRating = parseFloat(rawRating);
    return Number.isFinite(parsedRating) ? parsedRating : 0;
  };


  const [searchText,setSearchText]=useState("") //whenever we change local state variable ,REACT rerenders the component

  


  //whenever state variable updates, react triggers reconcilation cycle(re-rendering)
  //console.log("body rendered")//renders two times loads->render->api->rerenders........
    //console.log("useEffect called");//when thr body component render ,as soon as render cycle finish the useEffect is called
  useEffect(() => {
    const filtered = ListOfRestaurant.filter((res) => {
      const matchesSearch = res?.info?.name
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesRating = showTopRatedOnly ? getRestaurantRating(res) > 4 : true;
      return matchesSearch && matchesRating;
    });

    setFilteredRestaurants(filtered);
  }, [searchText, ListOfRestaurant, showTopRatedOnly]);

  useEffect(() => {
    fetchData();
  }, []);
const fetchData = async () => {
  try {
    setIsLoading(true);
    setFetchError("");

    const data = await fetch(`${API_BASE_URL}/api/restaurants`);
    if (!data.ok) {
      throw new Error(`Request failed: ${data.status}`);
    }
    const json = await data.json();

    //optional chaninhg
    const restaurants = json?.data?.cards
      ?.filter(card => card?.card?.card?.gridElements?.infoWithStyle?.restaurants)
      ?.flatMap(card => card?.card?.card?.gridElements?.infoWithStyle?.restaurants);

    setListOfRestaurant(restaurants || []);
    setFilteredRestaurants(restaurants || []);
  } catch (error) {
    console.error(error);
    setFetchError("Failed to load restaurants. Please refresh or try again later.");
  } finally {
    setIsLoading(false);
  }
};

//conditinal rendering
// if(ListOfRestaurant.length===0){
//   return <Shimmer />;
// }



  if (isLoading) return <Shimmer />;

  if (fetchError) {
    return (
      <div className="body">
        <p>{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="body">

       <h1 className="hero-title">
        Order food...! <br />
        Explore flavors that match your mood.
      </h1>

      <div className="filter">

        <div className="search">
          <input
            type="search"
            className="search-box"
            placeholder="Search your cravings..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          
         <button
            className="search-btn" 
            onClick={() => {
              const filtered = ListOfRestaurant.filter((res) =>
                res.info.name
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              );
              setFilteredRestaurants(filtered);
            }}
          >
            Search
          </button>
        </div>
        
        <button
          className="filter-btn"
          onClick={() => setShowTopRatedOnly((prev) => !prev)}
        >
          {showTopRatedOnly ? "Show all restaurants" : "Top rated restaurants"}
        </button>
      </div>

     <div className="res-container"> 
  {filteredRestaurants.map((restaurant, index) => (
    <Link 
      key={restaurant.info.id + "-" + index}
      to={"/restaurants/" + restaurant.info.id}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <RestaurantCard resData={restaurant} />
    </Link>
  ))} 
</div>
    </div>
  );
};

export default Body;


//react is re-rendering the whole body component ,but it is only updateing the input box value inside the DOM
//REACT compares the OLD virtual DOM AND NEW VIRTUAL DOM
//whole body component re-renders each time of key press(serach)
//reactfiber (reconsilation two virtual doms compares and updates the only specifice portion  required )of makes the react faster)

//when we write anything in search evryletter considers as react re-rendering it (serach)
