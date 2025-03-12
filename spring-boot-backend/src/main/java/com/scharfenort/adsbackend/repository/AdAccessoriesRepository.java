package com.scharfenort.adsbackend.repository;

import com.scharfenort.adsbackend.model.AdAccessories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdAccessoriesRepository extends JpaRepository<AdAccessories, Long> {
}
