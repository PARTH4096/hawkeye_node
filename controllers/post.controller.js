const mongoose = require('mongoose');
const Post = require('../models/post'); // Import post Model Schema
const User = mongoose.model('User');
 
module.exports.newpost=(req, res) => {
    // Check if post title was provided
    if (!req.body.title) {
      res.json({ success: false, message: 'post title is required.' }); // Return error message
    } else {
      // Check if post body was provided
      if (!req.body.body) {
        res.json({ success: false, message: 'post body is required.' }); // Return error message
      } else {
        // Check if post's creator was provided
        if (!req.body.createdBy) {
          res.json({ success: false, message: 'post creator is required.' }); // Return error
        } else {
          // Create the post object for insertion into database
          const post = new Post({
            title: req.body.title, // Title field
            body: req.body.body, // Body field
            createdBy: req.body.createdBy // CreatedBy field
          });
          // Save post into database
          post.save((err) => {
            // Check if error
            if (err) {
              // Check if error is a validation error
              if (err.errors) {
                // Check if validation error is in the title field
                if (err.errors.title) {
                  res.json({ success: false, message: err.errors.title.message }); // Return error message
                } else {
                  // Check if validation error is in the body field
                  if (err.errors.body) {
                    res.json({ success: false, message: err.errors.body.message }); // Return error message
                  } else {
                    res.json({ success: false, message: err }); // Return general error message
                  }
                }
              } else {
                res.json({ success: false, message: err }); // Return general error message
              }
            } else {
              res.json({ success: true, message: 'post saved!' }); // Return success message
            }
          });
        }
      }
    }
  };

  module.exports.all=(req, res) => {console.log("posts")
    // Search database for all post posts
    Post.find({}, (err, posts) => {
      // Check if error was found or not
      if (err) {
        res.json({ success: false, message: err }); // Return error message
      } else {
        // Check if posts were found in database
        if (!posts) {
          res.json({ success: false, message: 'No posts found.' }); // Return error of no posts found
        } else {
          res.json({ success: true, posts: posts }); // Return success and posts array
        }
      }
    }).sort({ '_id': -1 }); // Sort posts from newest to oldest
  };


  module.exports.post=(req, res) => {
    // Check if id is present in parameters
    if (!req.params.id) {
      res.json({ success: false, message: 'No post ID was provided.' }); // Return error message
    } else {
      // Check if the post id is found in database
      Post.findOne({ _id: req.params.id }, (err, post) => {
        // Check if the id is a valid ID
        if (err) {
          res.json({ success: false, message: 'Not a valid post id' }); // Return error message
        } else {
          // Check if post was found by id
          if (!post) {
            res.json({ success: false, message: 'post not found.' }); // Return error message
          } else {
            // Find the current user that is logged in
            console.log(req.body)
            User.findOne({ _id: req.body.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: err }); // Return error
              } else {
                // Check if firstName was found in database
                if (!user) {
                  res.json({ success: false, message: 'Unable to authenticate user' }); // Return error message
                } else {
                  // Check if the user who requested single post is the one who created it
                  if (user.firstName !== post.createdBy) {
                    res.json({ success: false,post: post, message: 'You are not authorized to edit this post.' }); // Return authentication reror
                  } else {
                    res.json({ success: true, post: post }); // Return success
                  }
                }
              }
            });
          }
        }
      });
    }
  };

  // module.exports.delete= (req, res) => {
  //   // Check if ID was provided in parameters
  //   if (!req.params.id) {
  //     res.json({ success: false, message: 'No id provided' }); // Return error message
  //   } else {
  //     // Check if id is found in database
  //     Post.findOne({ _id: req.params.id }, (err, post) => {
  //       // Check if error was found
  //       if (err) {
  //         res.json({ success: false, message: 'Invalid id' }); // Return error message
  //       } else {
  //         // Check if post was found in database
  //         if (!post) {
  //           res.json({ success: false, messasge: 'post was not found' }); // Return error message
  //         } else {
  //           post.remove((err) => {
  //             if (err) {
  //               res.json({ success: false, message: err }); // Return error message
  //             } else {
  //               res.json({ success: true, message: 'post deleted!' }); // Return success message
  //             }
  //           });
  //         }
  //       }
  //     });
  //   }
  // };



  

  module.exports.like=(req, res) => {console.log(req.body)
    // Check if id was passed provided in request body
    if (!req.body.id) { 
      res.json({ success: false, message: 'No id was provided.' }); // Return error message
    } else {
      // Search the database with id
      Post.findOne({ _id: req.body.id }, (err, post) => {
        // Check if error was encountered
        if (err) {
          res.json({ success: false, message: 'Invalid post id' }); // Return error message
        } else {
          // Check if id matched the id of a post post in the database
          if (!post) {
            res.json({ success: false, message: 'That post was not found.' }); // Return error message
          } else {
            // Get data from user that is signed in
            User.findOne({ _id: req.body.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
              } else {
                // Check if id of user in session was found in the database
                if (!user) {
                  res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
                } else {
                  // Check if user who liked post is the same user that originally created the post post
                  if (user.firstName === post.createdBy) {
                    res.json({ success: false, message: 'Cannot like your own post.' }); // Return error message
                  } else 
                  {
                    // Check if the user who liked the post has already liked the post post before
                    if (post.likedBy.includes(user.firstName)) {
                      res.json({ success: false, message: 'You already liked this post.' }); // Return error message
                    } else {
                      // Check if user who liked post has previously disliked a post
                      if (post.dislikedBy.includes(user.firstName)) {
                        post.dislikes--; // Reduce the total number of dislikes
                        const arrayIndex = post.dislikedBy.indexOf(user.firstName); // Get the index of the firstName in the array for removal
                        post.dislikedBy.splice(arrayIndex, 1); // Remove user from array
                        post.likes++; // Increment likes
                        post.likedBy.push(user.firstName); // Add firstName to the array of likedBy array
                        // Save post post data
                        post.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'post liked!' }); // Return success message
                          }
                        });
                      } else {
                        post.likes++; // Incriment likes
                        post.likedBy.push(user.firstName); // Add liker's firstName into array of likedBy
                        // Save post post
                        post.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'post liked!' }); // Return success message
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  };














  module.exports.dislike=(req, res) => {
    // Check if id was provided inside the request body
    if (!req.body.id) {
      res.json({ success: false, message: 'No id was provided.' }); // Return error message
    } else {
      // Search database for post post using the id
      Post.findOne({ _id: req.body.id }, (err, post) => {
        // Check if error was found
        if (err) {
          res.json({ success: false, message: 'Invalid post id' }); // Return error message
        } else {
          // Check if post post with the id was found in the database
          if (!post) {
            res.json({ success: false, message: 'That post was not found.' }); // Return error message
          } else {
            // Get data of user who is logged in
            User.findOne({ _id: req.body.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
              } else {
                // Check if user was found in the database
                if (!user) {
                  res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
                } else {
                  // Check if user who disliekd post is the same person who originated the post post
                  if (user.firstName === post.createdBy) {
                    res.json({ success: false, message: 'Cannot dislike your own post.' }); // Return error message
                  } else
                   {
                    // Check if user who disliked post has already disliked it before
                    if (post.dislikedBy.includes(user.firstName)) {
                      res.json({ success: false, message: 'You already disliked this post.' }); // Return error message
                    } else {
                      // Check if user has previous disliked this post
                      if (post.likedBy.includes(user.firstName)) {
                        post.likes--; // Decrease likes by one
                        const arrayIndex = post.likedBy.indexOf(user.firstName); // Check where firstName is inside of the array
                        post.likedBy.splice(arrayIndex, 1); // Remove firstName from index
                        post.dislikes++; // Increase dislikeds by one
                        post.dislikedBy.push(user.firstName); // Add firstName to list of dislikers
                        // Save post data
                        post.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'post disliked!' }); // Return success message
                          }
                        });
                      } else {
                        post.dislikes++; // Increase likes by one
                        post.dislikedBy.push(user.firstName); // Add firstName to list of likers
                        // Save post data
                        post.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'post disliked!' }); // Return success message
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  };

  module.exports.comment=(req, res) => {console.log("comment")
    // Check if comment was provided in request body
    if (!req.body.comment) {
      res.json({ success: false, message: 'No comment provided' }); // Return error message
    } else {
      // Check if id was provided in request body
      if (!req.body.id) {
        res.json({ success: false, message: 'No id was provided' }); // Return error message
      } else {
        // Use id to search for post post in database
        Post.findOne({ _id: req.body.id }, (err, post) => {
          // Check if error was found
          if (err) {
            res.json({ success: false, message: 'Invalid post id' }); // Return error message
          } else {
            // Check if id matched the id of any post post in the database
            if (!post) {
              res.json({ success: false, message: 'post not found.' }); // Return error message
            } else {
              // Grab data of user that is logged in
              User.findOne({ _id: req.body.userId }, (err, user) => {
                // Check if error was found
                if (err) {
                  res.json({ success: false, message: 'Something went wrong' }); // Return error message
                } else {
                  // Check if user was found in the database
                  if (!user) {
                    res.json({ success: false, message: 'User not found.' }); // Return error message
                  } else {
                    // Add the new comment to the post post's array
                    post.comments.push({
                      comment: req.body.comment, // Comment field
                      commentator: user.firstName // Person who commented
                    });
                    // Save post post
                    post.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Comment saved' }); // Return success message
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  };

  module.exports.delete= (req, res) => {
    // Check if ID was provided in parameters
    if (!req.body.id) {
      res.json({ success: false, message: 'No id provided' }); // Return error message
    } else {
      // Check if id is found in database
      Post.findOne({ _id: req.body.id }, (err, post) => {
        // Check if error was found
        if (err) {
          res.json({ success: false, message: 'Invalid id' }); // Return error message
        } else {
          // Check if post was found in database
          if (!post) {
            res.json({ success: false, messasge: 'post was not found' }); // Return error message
          } else {
            // Get info on user who is attempting to delete post
            User.findOne({ _id: req.body.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: err }); // Return error message
              } else {
                // Check if user's id was found in database
                if (!user) {
                  res.json({ success: false, message: 'Unable to authenticate user.' }); // Return error message
                } else {console.log(user)
                  // Check if user attempting to delete post is the same user who originally posted the post
                  if (user.firstName!== post.createdBy) {
                    res.json({ success: false, message: 'You are not authorized to delete this post post' }); // Return error message
                  } else {
                    // Remove the post from database
                    post.remove((err) => {
                      if (err) {
                        res.json({ success: false, message: err }); // Return error message
                      } else {
                        res.json({ success: true, message: 'post deleted!' }); // Return success message
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
  };



  module.exports.rate=(req, res) => {console.log(req.body)
    // Check if id was passed provided in request body
    if (!req.body.id) { 
      res.json({ success: false, message: 'No id was provided.' }); // Return error message
    } else {
      // Search the database with id
      Post.findOne({ _id: req.body.id }, (err, post) => {
        // Check if error was encountered
        if (err) {
          res.json({ success: false, message: 'Invalid post id' }); // Return error message
        } else {
          // Check if id matched the id of a post post in the database
          if (!post) {
            res.json({ success: false, message: 'That post was not found.' }); // Return error message
          } else {
            // Get data from user that is signed in
            User.findOne({ _id: req.body.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
              } else {
                // Check if id of user in session was found in the database
                if (!user) {
                  res.json({ success: false, message: 'Could not authenticate user.' }); // Return error message
                } else {
                  
                  // Check if user who liked post is the same user that originally created the post post
                  if (user.firstName === post.createdBy) {
                    res.json({ success: false, message: 'Cannot rate your own post.' }); // Return error message
                  } else 
                  { if (post.ratedUsers.includes(user.firstName)) {
                    res.json({ success: false, message: 'You are already rated.' })
                  }
                  else
                        {post.rate=(post.rate*post.ratedBy+req.body.rate)/(post.ratedBy+1)
                          post.ratedBy++;
                          post.ratedUsers.push(user.firstName);
                        post.save((err,post) => {
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {console.log(post)
                            res.json({ success: true, message: 'Rated post!' }); // Return success message
                          }
                        });
                      }
                    
                  }
                }
              }
            });
          }
        }
      });
    }
  };