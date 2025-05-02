// This file contains the functions that interact with the database
import { doc, setDoc, getDoc, updateDoc, getDocs, collection, query, orderBy, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "./Firebase";

export const addComment = async (pollId, walletAddress, content) => {
    try {
        const commentsRef = collection(db, "comments");
        await addDoc(commentsRef, {
            pollId: pollId.toString(),
            author: walletAddress,
            content: content,
            createdAt: serverTimestamp()
        });
        console.log(`Comment added to poll ${pollId}`);
    } catch (error) {
        console.error(`Error adding comment to poll ${pollId}:`, error);
    }
};

export const removeComment = async (pollId, commentId) => {
    try {
        const commentsRef = collection(db, "comments");
        const q = query(commentsRef);
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (document) => {
            const data = document.data();
            if (data.pollId === pollId.toString() && document.id === commentId) {
                await deleteDoc(doc(db, "comments", document.id));
                console.log(`Comment removed from poll ${pollId}`);
            }
        });
    } catch (error) {
        console.error(`Error removing comment from poll ${pollId}:`, error);
        throw error;
    }
};

export const getComments = async (pollId) => {
    try {
        const commentsRef = collection(db, "comments");
        const q = query(
            commentsRef,
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const comments = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.pollId === pollId.toString()) {
                comments.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        return comments;
    } catch (error) {
        console.error(`Error fetching comments for poll ${pollId}:`, error);
        return [];
    }
};

export const toggleLike = async (pollId, walletAddress) => {
    try {
        const likeId = `${pollId}-${walletAddress}`;
        const likeRef = doc(db, "likes", likeId);
        const likeSnap = await getDoc(likeRef);

        if (likeSnap.exists()) {
            // already liked
            await deleteDoc(likeRef);
            return false;
        } else {
            // not liked, so like it
            await setDoc(likeRef, {
                pollId: pollId.toString(),
                walletAddress,
                createdAt: serverTimestamp()
            });
            return true;
        }
    } catch (error) {
        console.error(`Error toggling like for poll ${pollId}:`, error);
        return false;
    }
};

export const getUserLikeStatus = async (pollId, walletAddress) => {
    try {
        if (!walletAddress) return false;

        const likeId = `${pollId}-${walletAddress}`;
        const likeRef = doc(db, "likes", likeId);
        const likeSnap = await getDoc(likeRef);

        return likeSnap.exists();
    } catch (error) {
        console.error(`Error checking like status for poll ${pollId}:`, error);
        return false;
    }
};

export const getLikesCount = async (pollId) => {
    try {
        const likesRef = collection(db, "likes");
        const q = query(likesRef);
        const querySnapshot = await getDocs(q);

        let count = 0;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.pollId === pollId.toString()) {
                count++;
            }
        });

        return count;
    } catch (error) {
        console.error(`Error counting likes for poll ${pollId}:`, error);
        return 0;
    }
};

export const addToBlacklist = async (pollId) => {
    try {
        const blacklistId = `poll-${pollId}`;
        const blacklistRef = doc(db, "blacklist", blacklistId);
        await setDoc(blacklistRef, {
            pollId: pollId.toString(),
            createdAt: serverTimestamp()
        });
        console.log(`Poll ${pollId} added to blacklist`);
        return true;
    } catch (error) {
        console.error(`Error adding poll ${pollId} to blacklist:`, error);
        return false;
    }
};

export const removeFromBlacklist = async (pollId) => {
    try {
        const blacklistId = `poll-${pollId}`;
        const blacklistRef = doc(db, "blacklist", blacklistId);
        await deleteDoc(blacklistRef);
        console.log(`Poll ${pollId} removed from blacklist`);
        return true;
    } catch (error) {
        console.error(`Error removing poll ${pollId} from blacklist:`, error);
        return false;
    }
};


export const getBlacklistedPolls = async () => {
    try {
        const blacklistRef = collection(db, "blacklist");
        const blacklistSnap = await getDocs(blacklistRef);
        
        const blacklistedPolls = [];
        blacklistSnap.forEach((doc) => {
            const data = doc.data();
            blacklistedPolls.push(data.pollId);
        });
        
        return blacklistedPolls;
    } catch (error) {
        console.error("Error getting blacklisted polls:", error);
        return [];
    }
};