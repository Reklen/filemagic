class AddOffsetToPost < ActiveRecord::Migration
  def change
    add_column :posts, :cover_offset_x, :string
    add_column :posts, :cover_offset_y, :string
  end
end
