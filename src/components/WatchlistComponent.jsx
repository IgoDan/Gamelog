import {
    Box,
    Flex,
    Heading,
    IconButton,
    Image,
    Text,
    Tooltip,
    CircularProgress,
    CircularProgressLabel,
    Input
} from "@chakra-ui/react";
import { Link } from 'react-router-dom'
import { imagePath } from '../services/api'
import { color } from 'framer-motion'
import { StarIcon, DeleteIcon } from '@chakra-ui/icons';
import { useFirestore } from '../services/firestore';
import { useAuth } from '../context/useAuth';
import { createId, ratingToPercentage, resolveRatingColor } from "../utils/helper";
import StarRatingDisplay from "../widgets/StarRatingDisplay";
import { useEffect, useState } from "react";

const WatchlistComponent = ({ item, type, setWatchlist }) => {
    const { removeFromWatchlist, checkIfInWatchlist, fetchWatchlistElement } = useFirestore();
    const { user } = useAuth();

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleRemoveClick = (event) => {
        event.preventDefault(); // Prevent the default behavior (link redirection)
        const itemId = createId(item?.id, item?.type);
        removeFromWatchlist(user?.uid, itemId).then(() => {
            setWatchlist((prev) => prev.filter((el) => el.id !== item.id));
        });
    };

    useEffect(() => {
        console.log("item", item)
        if (!user) {
            setIsInWatchlist(false);
            return;
        } else {
            const dataId = createId(item?.id, type);
            checkIfInWatchlist(user?.uid, dataId).then((data) => {
                setIsInWatchlist(data);
            });
            fetchWatchlistElement(user?.uid, dataId).then((watchlistElement) => {
                if (watchlistElement) {
                    setRating(watchlistElement.user_rating);
                    setReview(watchlistElement.user_review);
                }
            });
        }
    }, [])

    return (
        <Link to={`/${type}/${item.id}`}>
            <Flex gap="4" bg="gray.900" padding="25px" borderRadius="8px" w="600px">

                <Box position="relative">
                    <Image
                        src={`${imagePath}/${item.poster_path}`}
                        alt={item.title}
                        height="240px"
                        minW="180px"
                        objectFit="cover"
                    />
                    <Tooltip label="Remove from watchlist">
                        <IconButton
                            aria-label="Remove from watchlist"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            zIndex="999"
                            top="8px"
                            left="8px"
                            onClick={handleRemoveClick}
                        />
                    </Tooltip>
                </Box>

                <Flex flexDirection="column" gap="4" w="420px" ml={"10px"} justifyContent={"center"}>

                    <Flex flexDirection={"column"} justifyContent="space-between" alignItems="center" gap="2">
                        <Heading fontSize={{ base: 'xl', md: 'xl' }} noOfLines={1}>
                            {item?.title || item?.name}
                        </Heading>
                        <Flex alignItems="center" gap="1" justifyContent={"center"}>
                            <Text fontSize="sm" color="gray.400" textTransform="uppercase">
                                {item?.type === "movie" ? "Movie" : "TV Series"}
                            </Text>
                            <Text fontSize="sm" color="gray.400">
                                -
                            </Text>
                            <Text fontSize="sm" color="gray.400">
                                {new Date(item?.release_date || item?.first_air_date).getFullYear() || "N/A"}
                            </Text>
                        </Flex>
                    </Flex>

                    <Flex flexDirection="row" alignItems="center" gap="2" justifyContent={"center"}>
                        <CircularProgress
                            value={ratingToPercentage(item?.vote_average)}
                            size="50px"
                            color={resolveRatingColor(item?.vote_average)}
                            thickness="6px"
                        >
                            <CircularProgressLabel fontSize="sm">
                                {ratingToPercentage(item?.vote_average)}%
                            </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontWeight={"bold"} fontSize="sm" mr={6}>
                            TMDB
                        </Text>
                        <CircularProgress
                            value={0}
                            size="50px"
                            color={resolveRatingColor(item?.vote_average)}
                            thickness="6px"
                        >
                            <CircularProgressLabel fontSize="sm">0</CircularProgressLabel>
                        </CircularProgress>
                        <Text fontWeight={"bold"} fontSize="sm">
                            MOVIELOG
                        </Text>
                    </Flex>

                    <Flex flexDirection="column" gap="6" alignItems={"center"}>
                        <StarRatingDisplay rating={rating} setRating={setRating} count={10} />
                        <Input
                            type="text"
                            placeholder="No review found"
                            value={review}/>
                    </Flex>
                </Flex>
            </Flex>
        </Link>
    );
};

export default WatchlistComponent