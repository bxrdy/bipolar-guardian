
-- This function will be triggered when a new user signs up.
-- It inserts a new row into the public.user_profile table,
-- populating it with the user's ID, first name, and email.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = ''
AS $$
BEGIN
  INSERT INTO public.user_profile (id, first_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'first_name', new.email);
  RETURN new;
END;
$$;

-- This trigger calls the handle_new_user function after a new user is inserted into the auth.users table.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
